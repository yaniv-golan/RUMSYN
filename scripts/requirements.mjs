import {readFileSync} from 'node:fs';
import {validateGate} from './gate.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const register=read('docs/requirements-register.json'),inventory=read('docs/acceptance-obligations.json');
const raw=readFileSync('docs/acceptance-baseline.json','utf8');
const errors=validateGate({register,inventory,baseline:{...JSON.parse(raw),raw},baselineDigest:readFileSync('docs/acceptance-baseline.sha256','utf8').trim(),release:process.argv.includes('--release')});
if(process.argv.includes('--report')) {
 console.log(`${register.requirements.length} requirements; ${inventory.obligations.length} obligations; inventory ${inventory.reviewStatus}`);
 for(const r of register.requirements) console.log(`${r.id} ${r.release} ${r.milestone} ${r.status}`);
} else {console.log(errors.length?errors.join('\n'):'PASS: structural inventory consistency; no feature acceptance claimed');process.exitCode=errors.length?1:0;}
