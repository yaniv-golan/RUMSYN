import {clone, validateState, measurement} from '../model/index.js';
export class CommandSession {
  constructor(state, history = [], cursor = history.length) {
    this.state = clone(validateState(state));
    if (!Array.isArray(history) || !Number.isSafeInteger(cursor) || cursor < 0 || cursor > history.length) throw new Error('Invalid history cursor');
    this.history = clone(history); this.cursor = cursor;
    for (const entry of this.history) { validateState(entry.before); validateState(entry.after); }
    this.applied = new Set(); this.proposals = new Map(); this.nextId = 0;
  }
  previewWallLength(wallId, value) {
    const wall = this.state.walls.find(w=>w.id===wallId);
    if (!wall) throw new Error('Unknown wall');
    if (wall.locked) throw new Error('Wall measurement is locked');
    const after = clone(this.state);
    after.walls.find(w=>w.id===wallId).length = measurement(value, 'adjusted');
    after.revision++;
    validateState(after); // A conflicting opening is an error, never resized/deleted.
    const proposal = {id:`proposal-${++this.nextId}`, baseRevision:this.state.revision, changes:[{wallId,oldValue:wall.length.value,newValue:value,reason:'Explicit accepted dimension edit'}], affected:this.state.attachments.filter(a=>a.wallId===wallId).map(a=>a.id), after};
    this.proposals.set(proposal.id, clone(proposal));
    return clone(proposal);
  }
  cancel(id) { this.proposals.delete(id); }
  apply(id) {
    if (this.applied.has(id)) throw new Error('Proposal already applied');
    const proposal = this.proposals.get(id);
    if (!proposal) throw new Error('Unknown or cancelled proposal');
    if (proposal.baseRevision !== this.state.revision) throw new Error('Stale preview; revalidate');
    validateState(proposal.after);
    this.history.splice(this.cursor);
    this.history.push({before:clone(this.state),after:clone(proposal.after),changes:clone(proposal.changes)});
    this.cursor++;
    this.state = clone(proposal.after);
    this.proposals.delete(id); this.applied.add(id);
    return clone(this.state);
  }
  undo() {
    if (this.cursor === 0) return clone(this.state);
    this.state = {...clone(this.history[--this.cursor].before),revision:this.state.revision+1};
    return clone(this.state);
  }
  redo() {
    if (this.cursor === this.history.length) return clone(this.state);
    this.state = {...clone(this.history[this.cursor++].after),revision:this.state.revision+1};
    return clone(this.state);
  }
  serialize() { return JSON.stringify({state:this.state,history:this.history,cursor:this.cursor}); }
  static reopen(json) { const {state,history,cursor}=JSON.parse(json); return new CommandSession(state,history,cursor); }
}
