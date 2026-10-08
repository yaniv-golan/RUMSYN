import {readFileSync} from 'node:fs';
import {candidateIdentity} from './identity.mjs';
import {digest} from './gate.mjs';
const raw=readFileSync('artifacts/candidate.json');if(digest(raw)!==readFileSync('artifacts/candidate.sha256','utf8').trim())throw new Error('Candidate manifest modified');
const frozen=JSON.parse(raw),actual=candidateIdentity();
for(const key of ['sourceCommit','sourceDigest','buildDigest','acceptanceInventoryDigest','lockfileDigest'])if(frozen[key]!==actual[key])throw new Error(`Frozen candidate mismatch: ${key}`);
console.log('PASS: actual source/build/inventory/lockfile match frozen local candidate');
