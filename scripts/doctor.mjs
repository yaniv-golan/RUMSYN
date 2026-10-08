import {readFileSync,existsSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import net from 'node:net';
import {chromium,firefox,webkit} from 'playwright';
const problems=[];
const runtime=readFileSync('.nvmrc','utf8').trim();
if(process.version!==`v${runtime}`)problems.push(`Use Node ${runtime}: nvm use`);
let pnpm='unavailable';try{pnpm=execFileSync('pnpm',['--version'],{encoding:'utf8'}).trim();}catch{problems.push('Install pnpm 10.33.0 via corepack');}
if(pnpm!=='10.33.0')problems.push('Use pinned pnpm 10.33.0');
for(const binary of ['git'])try{execFileSync(binary,['--version']);}catch{problems.push(`Missing ${binary}`);}
for(const [name,browser]of Object.entries({chromium,firefox,webkit}))if(!existsSync(browser.executablePath()))problems.push(`${name} unavailable: pnpm exec playwright install ${name}`);
for(const path of ['tests/fixtures/user-room.json','pnpm-lock.yaml'])if(!existsSync(path))problems.push(`Missing ${path}`);
const dir=mkdtempSync(`${tmpdir()}/rumsyn-doctor-`);writeFileSync(`${dir}/probe`,'ok');rmSync(dir,{recursive:true});
await new Promise(resolve=>{const s=net.createServer();s.once('error',e=>{problems.push(`Port 5173 unavailable (${e.code}); select a free port`);resolve();});s.listen(5173,'127.0.0.1',()=>s.close(resolve));});
console.log(JSON.stringify({node:process.version,pnpm,platform:process.platform,architecture:process.arch,problems},null,2));process.exitCode=problems.length?1:0;
