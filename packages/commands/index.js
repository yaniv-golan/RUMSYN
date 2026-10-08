import {placementWarnings} from '../geometry/placement.js';
import {PROJECT_LIMITS,jsonBytes} from '../model/limits.js';
import {measuredRoom} from '../model/room.js';
import {solveQuadrilateral} from '../model/solver.js';
import {clone, validateState, measurement} from '../model/index.js';
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
function equivalent(a,b){const {revision:ar,...av}=a,{revision:br,...bv}=b;return JSON.stringify(canonical(av))===JSON.stringify(canonical(bv));}
export class CommandSession {
  constructor(state, history = [], cursor = history.length) {
    this.state = clone(validateState(state));
    if (!Array.isArray(history) || !Number.isSafeInteger(cursor) || cursor < 0 || cursor > history.length) throw new Error('Invalid history cursor');
    this.history = clone(history); this.cursor = cursor;
    for (const entry of this.history) { validateState(entry.before); validateState(entry.after);if(entry.before.id!==this.state.id||entry.after.id!==this.state.id)throw new Error('History project identity mismatch'); }
    for(let i=1;i<this.history.length;i++)if(!equivalent(this.history[i-1].after,this.history[i].before))throw new Error('History chain does not reconnect');
    if(this.history.length && !equivalent(this.state,this.cursor===0?this.history[0].before:this.history[this.cursor-1].after))throw new Error('History cursor disagrees with current project');
    this.historyByteSizes=this.history.map(jsonBytes);
    this.applied = new Set(); this.proposals = new Map(); this.nextId = 0;
  }
  previewWallLength(wallId, value) {
    const wall = this.state.walls.find(w=>w.id===wallId);
    if (!wall) throw new Error('Unknown wall');
    if (wall.locked) throw new Error('Wall measurement is locked');
    const after = clone(this.state);
    after.walls.find(w=>w.id===wallId).length = measurement(value, 'adjusted');
    if(after.room){const result=solveQuadrilateral({sides:after.walls.map(w=>w.length.value),diagonal:after.room.diagonal.value,orientation:after.room.orientation});if(result.status!=='solved')throw new Error(result.reason);after.room.vertices=result.coordinates;}
    after.revision++;
    validateState(after); // A conflicting opening is an error, never resized/deleted.
    const proposal = {id:`proposal-${++this.nextId}`, baseRevision:this.state.revision, changes:[{wallId,oldValue:wall.length.value,newValue:value,reason:'Explicit accepted dimension edit'}], affected:this.state.attachments.filter(a=>a.wallId===wallId).map(a=>a.id), after};
    this.proposals.set(proposal.id, clone(proposal));
    return clone(proposal);
  }
  previewMutation(label,mutate){
    const after=clone(this.state);mutate(after);after.revision++;validateState(after);
    const proposal={id:`proposal-${++this.nextId}`,baseRevision:this.state.revision,changes:[{reason:label}],affected:[],after};
    this.proposals.set(proposal.id,clone(proposal));return clone(proposal);
  }
  previewRoom(input){return this.previewMutation('Create measured room',after=>{if(after.room)throw new Error('Use dimension edits for an existing room');Object.assign(after,measuredRoom(input));});}
  previewOpening(item){return this.previewMutation('Add opening',after=>{if(!after.room)throw new Error('Create a room first');after.attachments.push(clone(item));});}
  previewFurniture(item){const proposal=this.previewMutation('Place furniture',after=>{if(!after.room)throw new Error('Create a room first');(after.furniture??=[]).push(clone(item));});proposal.warnings=placementWarnings(this.state,item);this.proposals.set(proposal.id,clone(proposal));return clone(proposal);}
  previewFurnitureEdit(id,patch){return this.previewMutation('Edit furniture',after=>{const f=after.furniture?.find(f=>f.id===id);if(!f)throw new Error('Unknown furniture');for(const key of Object.keys(patch))if(!['x','y','elevation','rotation','width','depth','height'].includes(key))throw new Error('Unsupported furniture property');if(f.product&&['width','depth','height'].some(k=>k in patch&&patch[k]!==f.product.dimensions[k]))throw new Error('Catalog product dimensions are fixed. Use a generic placeholder for custom sizes.');Object.assign(f,clone(patch));});}
  cancel(id) { this.proposals.delete(id); }
  apply(id) {
    if (this.applied.has(id)) throw new Error('Proposal already applied');
    const proposal = this.proposals.get(id);
    if (!proposal) throw new Error('Unknown or cancelled proposal');
    if (proposal.baseRevision !== this.state.revision) throw new Error('Stale preview; revalidate');
    validateState(proposal.after);
    const entry={before:clone(this.state),after:clone(proposal.after),changes:clone(proposal.changes)};
    const size=jsonBytes(entry),historySize=this.historyByteSizes.slice(0,this.cursor).reduce((sum,n)=>sum+n,0)+size;
    if(historySize+jsonBytes(proposal.after)+this.cursor+256>PROJECT_LIMITS.uncompressedBytes)throw new Error('Project/history limit reached; current project can still be saved. Export a backup before starting a new project.');
    this.history.splice(this.cursor);this.historyByteSizes.splice(this.cursor);
    this.history.push(entry);this.historyByteSizes.push(size);
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
