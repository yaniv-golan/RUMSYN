import {placementWarnings} from '../geometry/placement.js';
import {PROJECT_LIMITS,jsonBytes} from '../model/limits.js';
import {polygonRoom,measuredRoom} from '../model/room.js';
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
    if (value===wall.length.value) throw new Error('No changes requested');
    if (wall.locked) throw new Error('Wall measurement is locked');
    const after = clone(this.state);
    after.walls.find(w=>w.id===wallId).length = measurement(value, 'adjusted');
    if(after.room?.kind==='polygon'){const a=after.room.corners.find(c=>c.id===wall.geometry.startCornerId),b=after.room.corners.find(c=>c.id===wall.geometry.endCornerId),actual=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/actual,uy=(b.y-a.y)/actual;const proposal=this.previewCornerMove(b.id,a.x+ux*value,a.y+uy*value);proposal.after.walls.find(w=>w.id===wall.id).length=measurement(value,'adjusted');if(proposal.after.room.entry==='perimeter'){const i=proposal.after.walls.findIndex(w=>w.id===wall.id);Object.assign(proposal.after.room.perimeterMeasurements[i],{length:value,lengthSource:'adjusted'});}for(const c of proposal.changes)if(c.wallId===wall.id&&c.unit==='cm')c.newValue=value;validateState(proposal.after);this.proposals.set(proposal.id,clone(proposal));return clone(proposal);}
    if(after.room){const result=solveQuadrilateral({sides:after.walls.map(w=>w.length.value),diagonal:after.room.diagonal.value,orientation:after.room.orientation});if(result.status!=='solved')throw new Error(result.reason);if(after.schemaVersion===2)after.room.corners=after.room.corners.map((c,i)=>({...c,x:result.coordinates[i][0],y:result.coordinates[i][1]}));else after.room.vertices=result.coordinates;}
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
  previewWallLock(wallId,locked){const before=this.state.walls.find(w=>w.id===wallId);if(!before||typeof locked!=='boolean')throw new Error('Invalid wall lock');const proposal=this.previewMutation('Change wall length lock',after=>{after.walls.find(w=>w.id===wallId).locked=locked;});proposal.changes=[{wallId,oldLocked:Boolean(before.locked),newLocked:locked,reason:'Change wall length lock'}];this.proposals.set(proposal.id,clone(proposal));return clone(proposal);}
  previewCornerMove(cornerId,x,y){
    if(this.state.room?.kind!=='polygon'||![x,y].every(Number.isFinite))throw new Error('Select a polygon corner and enter finite coordinates');
    const before=this.state,corner=before.room.corners.find(c=>c.id===cornerId);if(!corner)throw new Error('Unknown corner');if(x===corner.x&&y===corner.y)throw new Error('No changes requested');const changes=[],hosts=[];
    if(x!==corner.x)changes.push({wallId:`${cornerId} · X`,oldValue:corner.x,newValue:x,unit:'cm',reason:'Move selected corner'});if(y!==corner.y)changes.push({wallId:`${cornerId} · Y`,oldValue:corner.y,newValue:y,unit:'cm',reason:'Move selected corner'});
    const proposal=this.previewMutation('Move polygon corner and review neighbors',after=>{
      const moved=after.room.corners.find(c=>c.id===cornerId);moved.x=x;moved.y=y;
      if(after.room.entry==='perimeter'){after.room.originalPerimeterMeasurements??=clone(before.room.perimeterMeasurements);after.room.originalPerimeterOrigin??=clone(before.room.perimeterOrigin??[0,0]);after.room.perimeterOrigin=[after.room.corners[0].x,after.room.corners[0].y];}
      for(let i=0;i<after.walls.length;i++){const wall=after.walls[i];if(![wall.geometry.startCornerId,wall.geometry.endCornerId].includes(cornerId))continue;hosts.push(wall.id);const a=after.room.corners.find(c=>c.id===wall.geometry.startCornerId),b=after.room.corners.find(c=>c.id===wall.geometry.endCornerId),oldWall=before.walls[i],oldA=before.room.corners.find(c=>c.id===wall.geometry.startCornerId),oldB=before.room.corners.find(c=>c.id===wall.geometry.endCornerId),length=Math.hypot(b.x-a.x,b.y-a.y),bearing=(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI+360)%360,oldBearing=(Math.atan2(oldB.y-oldA.y,oldB.x-oldA.x)*180/Math.PI+360)%360;
        if(Math.abs(length-oldWall.length.value)>1e-6){if(oldWall.locked)throw new Error(`Locked wall ${oldWall.name} prevents this corner move`);wall.length=measurement(length,'adjusted');changes.push({wallId:wall.id,oldValue:oldWall.length.value,newValue:length,unit:'cm',reason:'Adjacent edge changes with selected corner'});if(after.room.entry==='perimeter')Object.assign(after.room.perimeterMeasurements[i],{length,lengthSource:'adjusted'});}
        const angleDelta=Math.abs(((bearing-oldBearing+540)%360)-180);if(angleDelta>1e-8){if(before.room.perimeterMeasurements?.[i]?.directionLocked)throw new Error(`Locked direction on wall ${oldWall.name} prevents this corner move`);changes.push({wallId:wall.id,oldValue:oldBearing,newValue:bearing,unit:'degrees',reason:'Adjacent bearing changes with selected corner'});if(after.room.entry==='perimeter')Object.assign(after.room.perimeterMeasurements[i],{direction:bearing,directionSource:'adjusted'});}
      }
    });proposal.changes=changes;proposal.affected=before.attachments.filter(a=>hosts.includes(a.wallId)).map(a=>a.id);proposal.warnings=(proposal.after.furniture??[]).flatMap(f=>placementWarnings(proposal.after,f).map(w=>`${f.id}: ${w}`));this.proposals.set(proposal.id,clone(proposal));return clone(proposal);
  }
  previewOutline(input){return this.previewMutation('Create polygon perimeter',after=>{if(after.room)throw new Error('Create a new project for this entry method');Object.assign(after,polygonRoom(input));});}
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
