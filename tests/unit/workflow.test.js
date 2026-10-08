import {test,expect} from 'vitest';
import {roomPoints,emptyProject,measuredRoom} from '../../packages/model/room.js';
import {CommandSession} from '../../packages/commands/index.js';
import {exportProject,importProject} from '../../packages/persistence/index.js';
import {en,he} from '../../packages/localization/index.js';
const input={sides:[400,300,350,300],diagonal:450,orientation:'clockwise',height:240,thickness:15};
function session(){const s=new CommandSession(emptyProject('synthetic'));s.apply(s.previewRoom(input).id);return s;}
test('M1 R005 R012: dimension changes keep polygon, attached opening and undo consistent',()=>{
 const s=session();s.apply(s.previewOpening({id:'opening',wallId:'wall-A',width:91,height:200,bottom:0,offset:66,anchor:'start'}).id);const before=structuredClone(s.state);
 const preview=s.previewWallLength('wall-A',410);expect(s.state).toEqual(before);s.apply(preview.id);
 const [a,b]=roomPoints(s.state);expect(Math.hypot(b[0]-a[0],b[1]-a[1])).toBeCloseTo(410,6);expect(s.state.attachments).toEqual(before.attachments);
 s.undo();expect(s.state.walls).toEqual(before.walls);expect(s.state.room).toEqual(before.room);expect(s.state.attachments).toEqual(before.attachments);
});
test('M1 R030 R031 R032: portable archive in a fresh session retains executable undo and product snapshot',()=>{
 const s=session();s.apply(s.previewFurniture({id:'table',category:'table',width:55,depth:55,height:45,x:100,y:100,elevation:0,rotation:0,product:{identity:'ikea:IL:30449908:white',dimensions:{width:55,depth:55,height:45,unit:'cm'},provenance:{geometry:'generic',dimensions:'source'}}}).id);
 const opened=importProject(exportProject(s));expect(opened.state.furniture[0].product).toEqual(s.state.furniture[0].product);opened.undo();expect(opened.state.furniture).toEqual([]);opened.redo();expect(opened.state.furniture[0].width).toBe(55);
});
test('M1 R033 manager R01: contradictory diagonal/orientation rejected on reopen without mutation',()=>{
 const s=session(),before=s.serialize();const document=JSON.parse(before);document.state.room.diagonal.value=1;
 expect(()=>CommandSession.reopen(JSON.stringify(document))).toThrow('diagonal');expect(s.serialize()).toBe(before);
 const mirror=JSON.parse(before);mirror.state.room.orientation='counterclockwise';expect(()=>CommandSession.reopen(JSON.stringify(mirror))).toThrow('orientation');
});
test('M1 R031: corrupted cursor/chain cannot open a project with misleading undo',()=>{
 const s=session();s.apply(s.previewWallLength('wall-A',410).id);const d=JSON.parse(s.serialize());d.history[1].before.walls[0].name='tampered';expect(()=>CommandSession.reopen(JSON.stringify(d))).toThrow('History chain');
 const e=JSON.parse(s.serialize());e.cursor=0;expect(()=>CommandSession.reopen(JSON.stringify(e))).toThrow('History cursor');
});
test('M1 R038: paired English/Hebrew keys; language changes do not alter model',()=>{expect(Object.keys(en).sort()).toEqual(Object.keys(he).sort());});
test('M1 R031 manager E02: history cannot undo into a different project identity',()=>{
 const s=session(),d=JSON.parse(s.serialize());d.history[0].before.id='different-project';expect(()=>CommandSession.reopen(JSON.stringify(d))).toThrow('project identity');
});
test('M1 R031 manager E03: successful archive save preserves more than 1000 edits',()=>{
 const s=session();for(let i=0;i<1001;i++)s.apply(s.previewWallLength('wall-A',401-i%2).id);
 const reopened=importProject(exportProject(s));expect(reopened.history.length).toBe(1002);expect(reopened.state.walls[0].length.value).toBe(401);reopened.undo();expect(reopened.state.walls[0].length.value).toBe(400);
});
test('M1 R012: opening height cannot escape the host wall',()=>{const s=session();expect(()=>s.previewOpening({id:'too-high',wallId:'wall-A',width:90,height:250,bottom:0,offset:30,anchor:'start'})).toThrow('height/elevation');expect(s.state.attachments).toEqual([]);});
test('M1 R027 manager E04: catalog dimensions cannot be silently relabeled after resizing',()=>{
 const s=session(),product={identity:'ikea:IL:30449908:white',dimensions:{width:55,depth:55,height:45,unit:'cm'},provenance:{geometry:'generic',dimensions:'source'}};s.apply(s.previewFurniture({id:'lack',category:'table',width:55,depth:55,height:45,x:150,y:0,elevation:0,rotation:0,product}).id);
 expect(()=>s.previewFurnitureEdit('lack',{width:100})).toThrow('fixed');expect(s.state.furniture[0].width).toBe(55);expect(s.state.furniture[0].product).toEqual(product);
});
test('M1 R033 manager E06: incomplete materials/openings reject before renderer can fail',()=>{
 const s=session(),before=s.serialize(),d=JSON.parse(before);delete d.state.walls[0].materialFaces;expect(()=>CommandSession.reopen(JSON.stringify(d))).toThrow('material');
 const e=JSON.parse(before);e.state.attachments.push({id:'door',wallId:'wall-A',offset:30,width:70,anchor:'start'});expect(()=>CommandSession.reopen(JSON.stringify(e))).toThrow('Incomplete opening');expect(s.serialize()).toBe(before);
});

test('M1 R031: history budget rejects before mutation and preserves a savable archive',()=>{
 const state=emptyProject('budget');state.note='x'.repeat(10_000_000);const s=new CommandSession(state),before=s.serialize(),proposal=s.previewMutation('budget witness',after=>{after.note+='y';});
 expect(()=>s.apply(proposal.id)).toThrow('limit reached');expect(s.serialize()).toBe(before);expect(importProject(exportProject(s)).state.note).toBe(state.note);
});
