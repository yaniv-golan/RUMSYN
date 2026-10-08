import {writeFileSync,mkdirSync} from 'node:fs';
import {candidateIdentity} from './identity.mjs';
import {digest} from './gate.mjs';
mkdirSync('artifacts',{recursive:true});
const candidate=candidateIdentity();const raw=JSON.stringify(candidate,null,2)+'\n';writeFileSync('artifacts/candidate.json',raw);writeFileSync('artifacts/candidate.sha256',digest(raw)+'\n');console.log(JSON.stringify({...candidate,sourceFiles:`${candidate.sourceFiles.length} files (see candidate.json)`,buildFiles:`${candidate.buildFiles.length} files (see candidate.json)`},null,2));
