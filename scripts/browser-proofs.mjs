import {chromium} from 'playwright';
import {mkdirSync,writeFileSync,readdirSync,renameSync} from 'node:fs';
import {candidateIdentity} from './identity.mjs';
const dir='artifacts/browser';mkdirSync(dir,{recursive:true});
const attempt=`${dir}/attempt-${Date.now()}`;mkdirSync(attempt,{recursive:true});
for(const entry of readdirSync(dir,{withFileTypes:true}))if(entry.isFile()&&!entry.name.endsWith('.log'))renameSync(`${dir}/${entry.name}`,`${attempt}/${entry.name}`);
let produced=false;writeFileSync(`${dir}/run-status.json`,JSON.stringify({outcome:'running',started:new Date().toISOString()}));
process.on('exit',code=>writeFileSync(`${dir}/run-status.json`,JSON.stringify({outcome:code===0&&produced?'pass':'fail',finished:new Date().toISOString()})));
const candidate=candidateIdentity();if(!candidate.buildFiles.length)throw new Error('Build artifact absent');
const browser=await chromium.launch();
try {
 const page=await browser.newPage();const failures=[];
 page.on('pageerror',e=>failures.push(e.message));
 await page.goto(process.env.RUMSYN_PREVIEW_URL ?? 'http://127.0.0.1:4173/');
 writeFileSync(`${dir}/initial-snapshot.txt`,await page.locator('body').ariaSnapshot());
 await page.getByRole('button',{name:'Run measurement proof'}).click();
 await page.waitForFunction(()=>document.querySelector('#result').textContent.includes('underdetermined'));
 const solver=JSON.parse(await page.locator('#result').textContent());
 await page.getByRole('button',{name:'Run browser geometry proof'}).click();
 await page.waitForFunction(()=>document.querySelector('#result').textContent.includes('repeated100Ms')||document.querySelector('#result').textContent.includes('FAILED:'));
 const raw=await page.locator('#result').textContent();if(raw.startsWith('FAILED:'))throw new Error(raw);
 const geometry=JSON.parse(raw);
 const recoverySaved=await page.evaluate(()=>window.rumsynProof.saveRecoveryProof());
 await page.reload();await page.waitForFunction(()=>Boolean(window.rumsynProof));
 const recoveryReopened=await page.evaluate(()=>window.rumsynProof.reopenRecoveryProof());
 if(recoveryReopened.saved!==307||recoveryReopened.undone!==306||recoveryReopened.attachment.offset!==105||recoveryReopened.provenance!=='entered')throw new Error('Recovery/history mismatch');
 const recovery={saved:recoverySaved,reopened:recoveryReopened};
 const pdf=[];
 for(const format of ['a4','a3']){
   const r=await page.evaluate(async format=>{const r=await window.rumsynProof.generatePdfProof({format});return {bytes:Array.from(new Uint8Array(r.bytes)),meta:r.meta};},format);
   writeFileSync(`${dir}/m0-${format}.pdf`,Buffer.from(r.bytes));pdf.push(r.meta);
 }
 await page.screenshot({path:`${dir}/harness.png`,fullPage:true});
 const after=candidateIdentity();if(candidate.sourceDigest!==after.sourceDigest || candidate.buildDigest!==after.buildDigest)throw new Error('Candidate changed during browser proofs');
 const report={candidate,node:process.version,command:'pnpm proof:browser',browser:browser.version(),platform:process.platform,architecture:process.arch,url:page.url(),solver,geometry,recovery,pdf,failures,physicalDevices:'not_run'};
 writeFileSync(`${dir}/report.json`,JSON.stringify(report,null,2));
 if(failures.length)throw new Error(failures.join('\n'));
 produced=true;console.log(JSON.stringify({browser:report.browser,candidate:report.candidate.sourceDigest,build:report.candidate.buildDigest,recovery:report.recovery,pdf:report.pdf,failures},null,2));
}finally{await browser.close();}
