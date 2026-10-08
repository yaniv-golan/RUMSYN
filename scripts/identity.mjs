import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {digest} from './gate.mjs';
function walk(path){return readdirSync(path,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(e=>e.isDirectory()?walk(`${path}/${e.name}`):[`${path}/${e.name}`]);}
export function treeManifest(paths){return paths.filter(existsSync).flatMap(p=>readdirSafe(p)).sort().map(path=>({path,sha256:digest(readFileSync(path))}));}
function readdirSafe(path){try{return walk(path);}catch{return[path];}}
export function candidateIdentity(){
 const roots=['packages','apps','producer-seed','scripts','tests','.github','package.json','pnpm-lock.yaml','.nvmrc','vitest.config.js','vite.config.js','.gitignore','AGENTS.md','README.md','CONTRIBUTING.md','LICENSE','docs/requirements.md','docs/requirements-register.json','docs/acceptance-obligations.json','docs/acceptance-baseline.json','docs/acceptance-baseline.sha256','docs/scope-changes.md','docs/dependency-decisions.md','docs/delivery-plan.md','docs/development-infrastructure.md','docs/adversarial-review-2026-10-08.md','docs/decisions','docs/evidence/README.md'];
 const sourceFiles=treeManifest(roots),sourceDigest=digest(JSON.stringify(sourceFiles)),buildFiles=treeManifest(['dist']);
 let sourceCommit=null,dirty=true;
 try{sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();dirty=Boolean(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim());}catch{}
 return {sourceCommit,...(dirty?{dirtyDigest:sourceDigest}:{}),sourceDigest,buildDigest:digest(JSON.stringify(buildFiles)),catalogHashes:[],acceptanceInventoryDigest:digest(readFileSync('docs/acceptance-obligations.json')),lockfileDigest:digest(readFileSync('pnpm-lock.yaml')),sourceFiles,buildFiles};
}
