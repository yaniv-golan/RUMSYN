import {test,expect} from 'vitest';
import {solveQuadrilateral,reconcileSegments} from '../../packages/model/solver.js';
import {CommandSession} from '../../packages/commands/index.js';
import {measurement,parseLength} from '../../packages/model/index.js';
const input = {wallId:'D',total:{value:306},segments:[{id:'D1',value:105},{id:'window',value:91},{id:'D3',value:111}]};
const state = () => ({schemaVersion:1,revision:0,walls:[{id:'D',length:measurement(306)}],attachments:[{id:'window',wallId:'D',width:91,offset:105,anchor:'start',materialFaceId:'D:inside'}]});
test('S01 R010: length-only loop remains underdetermined and unchanged',()=>{
 const sides=[206,306,217,306],before=structuredClone(sides),r=solveQuadrilateral({sides});
 expect(r.status).toBe('underdetermined');expect(r.usefulMeasurements).toContain('diagonal AC');expect(sides).toEqual(before);
});
test('S02 R005: diagonal solves known synthetic 3x4 rectangle and reports mirror ambiguity',()=>{
 const r=solveQuadrilateral({sides:[3,4,3,4],diagonal:5,orientation:'clockwise'});
 // Independent projection of (0,0),(3,0),(3,4),(0,4) onto its AC axis.
 const expected=[[0,0],[1.8,2.4],[5,0],[3.2,-2.4]];
 r.coordinates.forEach((p,i)=>p.forEach((v,j)=>expect(v).toBeCloseTo(expected[i][j],8)));
 expect(solveQuadrilateral({sides:[3,4,3,4],diagonal:5}).status).toBe('ambiguous');
});
test('S03 R040: measured D discrepancy is one cm with no automatic correction',()=>{
 const before=structuredClone(input),r=reconcileSegments(input);
 expect(r.status).toBe('contradictory');expect(r.residualCm).toBe(1);expect(r.conflicts).toEqual(['total','D1','window','D3']);expect(input).toEqual(before);
});
test('S04 R010 R012: incompatible locks and opening conflict preserve all inputs',()=>{
 const locked=structuredClone(input);locked.total.locked=true;locked.segments.forEach(x=>x.locked=true);
 expect(reconcileSegments(locked).status).toBe('no_allowed_repair');
 expect(solveQuadrilateral({sides:[3,4,3,4],diagonal:9,orientation:'clockwise'}).status).toBe('contradictory');
 const session=new CommandSession(state()),before=structuredClone(session.state);
 expect(()=>session.previewWallLength('D',190)).toThrow('Opening no longer fits');expect(session.state).toEqual(before);
});
test('S05 R010: repair choices enumerate old/new/residual and require explicit apply',()=>{
 const repair=reconcileSegments(input),session=new CommandSession(state());
 const choice=repair.choices.find(c=>c.target==='total');expect(choice).toMatchObject({oldValue:306,newValue:307,residualCm:0});
 const proposal=session.previewWallLength('D',choice.newValue);expect(session.state.walls[0].length.value).toBe(306);
 expect(proposal.affected).toEqual(['window']);session.apply(proposal.id);expect(session.state.walls[0].length).toEqual(measurement(307,'adjusted'));
});
test('S06 R031: cancel, stale/replayed preview, reopen undo and attachments',()=>{
 const session=new CommandSession(state()),original=structuredClone(session.state);
 const cancelled=session.previewWallLength('D',307);session.cancel(cancelled.id);expect(session.state).toEqual(original);expect(()=>session.apply(cancelled.id)).toThrow('cancelled');
 const stale=session.previewWallLength('D',308),accepted=session.previewWallLength('D',307);session.apply(accepted.id);
 expect(()=>session.apply(stale.id)).toThrow('Stale');expect(()=>session.apply(accepted.id)).toThrow('already');
 const reopened=CommandSession.reopen(session.serialize());reopened.undo();expect(reopened.state.walls).toEqual(original.walls);expect(reopened.state.attachments).toEqual(original.attachments);
 reopened.redo();expect(reopened.state.walls[0].length.value).toBe(307);
});
test('R009: explicit units convert without mutating measurement records',()=>{expect(parseLength('1.64 m')).toBe(164);expect(parseLength('12 in')).toBe(30.48);expect(()=>parseLength('1.2')).toThrow();});
test('S02 manager witness: concave branch never mislabeled convex',()=>{
 const r=solveQuadrilateral({sides:[1,2,2,1],diagonal:1.5,orientation:'clockwise'});
 expect(r.status).toBe('unsupported_branch');
 // Independent signed turns of the original counterexample, not solver constants.
 const p=[[0,0],[-.25,Math.sqrt(.9375)],[1.5,0],[-.25,-Math.sqrt(.9375)]];
 const turns=p.map((a,i)=>{const b=p[(i+1)%4],c=p[(i+2)%4];return(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);});
 expect(turns.some(v=>v<0)&&turns.some(v=>v>0)).toBe(true);
});
test('S04 S05 R010 R012: mixed locks and every offered repair independently feasible',()=>{
 const locked=structuredClone(input);locked.segments[0].locked=true;locked.segments[1].locked=true;
 locked.attachments=[{id:'window',segmentId:'window',width:91,offset:105,lockedOffset:true}];
 const before=structuredClone(locked),r=reconcileSegments(locked);
 expect(r.choices.map(c=>c.target)).toEqual(['total','D3']);
 for(const choice of r.choices){
   const candidate=structuredClone(locked);
   if(choice.target==='total')candidate.total.value=choice.newValue;else candidate.segments.find(p=>p.id===choice.target).value=choice.newValue;
   expect(candidate.segments.reduce((sum,p)=>sum+p.value,0)).toBe(candidate.total.value);
   expect(candidate.segments.slice(0,2)).toEqual(before.segments.slice(0,2));
   expect(candidate.attachments[0].offset+candidate.attachments[0].width).toBeLessThanOrEqual(candidate.total.value);
   expect(choice.oldValue).toBe(choice.target==='total'?306:111);expect(choice.residualCm).toBe(0);expect(choice.reason.length).toBeGreaterThan(0);
 }
 expect(locked).toEqual(before);
});
test('S05 R012: attachment-breaking repair is unavailable, never offered feasible',()=>{
 const measured={wallId:'synthetic',total:{value:306},segments:[{id:'solid',value:205,locked:true},{id:'opening',value:100,locked:true}],attachments:[{id:'fixed-end',offset:296,width:10}]};
 const before=structuredClone(measured),r=reconcileSegments(measured);
 expect(r.status).toBe('no_allowed_repair');expect(r.choices).toEqual([]);expect(r.unavailable[0]).toMatchObject({target:'total',oldValue:306,newValue:305});expect(r.unavailable[0].reason).toContain('fixed-end');expect(measured).toEqual(before);
});
test('S05 R012 manager E08: local offset plus width must fit repaired segment',()=>{
 const input={wallId:'D',total:{value:306,locked:true},segments:[{id:'solid',value:105,locked:true},{id:'opening',value:100},{id:'tail',value:102,locked:true}],attachments:[{id:'window',segmentId:'opening',offset:114,offsetWithinSegment:9,width:91,lockedOffset:true}]};
 const before=structuredClone(input),r=reconcileSegments(input);expect(r.status).toBe('no_allowed_repair');expect(r.choices).toEqual([]);expect(r.unavailable[0].target).toBe('opening');expect(input).toEqual(before);
 expect(()=>reconcileSegments({...input,attachments:[{...input.attachments[0],offset:NaN}]})).toThrow('Invalid attachment offset');
});
test('S05 R012: generated local-span boundaries reject infeasible repairs',()=>{
 for(let offset=0;offset<=9;offset++)for(let width=90;width<=100-offset;width++){
  const measured={wallId:'synthetic',total:{value:306,locked:true},segments:[{id:'solid',value:105,locked:true},{id:'opening',value:100},{id:'tail',value:102,locked:true}],attachments:[{id:'window',segmentId:'opening',offset:105+offset,offsetWithinSegment:offset,width,lockedOffset:true}]};
  const r=reconcileSegments(measured);
  // Independent interval end calculation: repaired opening is [105,204].
  const fits=105+offset+width<=204;
  expect(r.choices.length).toBe(fits?1:0);
 }
});
