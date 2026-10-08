import {execFileSync} from 'node:child_process';
import {mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {candidateIdentity} from './identity.mjs';
mkdirSync('artifacts',{recursive:true});rmSync('artifacts/build-subject.json',{force:true});
if(process.version!=='v24.18.0')throw new Error('Use pinned Node24.18.0 for reproducible build');
const before=candidateIdentity();execFileSync(process.execPath,['node_modules/vite/bin/vite.js','build','apps/web','--config','vite.config.js','--outDir','../../dist','--emptyOutDir'],{stdio:'inherit'});const after=candidateIdentity();if(after.sourceDigest!==before.sourceDigest)throw new Error('Source changed during build');writeFileSync('artifacts/build-subject.json',JSON.stringify({sourceDigest:after.sourceDigest,buildDigest:after.buildDigest,node:process.version},null,2));
