import {test,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {zipSync,unzipSync,strFromU8,strToU8} from 'fflate';
import {exportProject,importProject} from '../../packages/persistence/index.js';
const baseline=JSON.parse(readFileSync('tests/fixtures/v1/v1-behavior-baseline.json'));
// Independent semantic projection only removes the newly documented topology
// representation. Expected values/behaviors remain frozen from the old engine.
function oldRepresentation(state){const result=structuredClone(state);result.schemaVersion=1;if(result.room){result.room.vertices=result.room.corners.map(c=>[c.x,c.y]);result.room.verticesProvenance=result.room.cornersProvenance;delete result.room.corners;delete result.room.cornersProvenance;for(const w of result.walls)delete w.geometry;}return result;}
test('M2 R031 R033: frozen actual v1 archives preserve every history snapshot at zero mid and tip',()=>{
 expect(baseline.engineCommit).toBe('54a23abdca0297e503bdb584619fe2eef7537fea');expect(baseline.cases.length).toBe(6);
 for(const witness of baseline.cases){const bytes=readFileSync(`tests/fixtures/v1/${witness.file}`);expect(createHash('sha256').update(bytes).digest('hex')).toBe(witness.sha256);const original=JSON.parse(strFromU8(unzipSync(bytes)['project.json'])),session=importProject(bytes);expect(session.importedVersion).toBe(1);expect(session.state.schemaVersion).toBe(2);expect(session.cursor).toBe(witness.cursor);expect(oldRepresentation(session.state)).toEqual(witness.before);expect(session.history.length).toBe(witness.historyLength);
  expect(session.history.map(e=>({...e,before:oldRepresentation(e.before),after:oldRepresentation(e.after)}))).toEqual(original.session.history);
  session.undo();expect(session.cursor).toBe(witness.afterUndo.cursor);expect(oldRepresentation(session.state)).toEqual(witness.afterUndo.state);const redoSession=importProject(bytes);redoSession.redo();expect(redoSession.cursor).toBe(witness.afterRedo.cursor);expect(oldRepresentation(redoSession.state)).toEqual(witness.afterRedo.state);
  const saved=exportProject(session),document=JSON.parse(strFromU8(unzipSync(saved)['project.json']));expect(document.version).toBe(2);const roundtrip=importProject(saved);expect(roundtrip.serialize()).toBe(session.serialize());
 }
});
test('M2 R033: corrupt legacy and unsupported future files reject without replacing current session',()=>{
 const bytes=readFileSync(`tests/fixtures/v1/${baseline.cases[1].file}`),session=importProject(bytes),before=session.serialize(),document=JSON.parse(strFromU8(unzipSync(bytes)['project.json']));document.session.history[1].after.room.diagonal.value=1;expect(()=>importProject(zipSync({'project.json':strToU8(JSON.stringify(document))}))).toThrow('diagonal');expect(session.serialize()).toBe(before);
 document.version=99;expect(()=>importProject(zipSync({'project.json':strToU8(JSON.stringify(document))}))).toThrow('Unsupported project version');expect(session.serialize()).toBe(before);
});
