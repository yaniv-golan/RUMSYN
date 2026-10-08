import {readFileSync} from 'node:fs';
import {digest} from './gate.mjs';
const actual=digest(readFileSync('tests/fixtures/user-room.json'));
if(actual!==readFileSync('tests/fixtures/user-room.sha256','utf8').trim()) throw new Error('Literal measured-room fixture changed; review required');
const f=JSON.parse(readFileSync('tests/fixtures/user-room.json','utf8'));
if(f.segments.D.reduce((a,b)=>a+b,0)-f.walls.D!==1 || f.door.reference!=='unresolved' || f.beamsBD.underside+f.beamsBD.height-f.ceiling!==1) throw new Error('Unresolved measurement contracts violated');
console.log('PASS: literal unresolved fixture and one-cm discrepancies preserved');
