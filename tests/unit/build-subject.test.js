import {test,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,mkdirSync,mkdtempSync,copyFileSync,symlinkSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {candidateIdentity} from '../../scripts/identity.mjs';
test('R043 manager stale-build witness: all browser runners reject source/build mismatch before evidence',()=>{
 const fixture=mkdtempSync(join(tmpdir(),'rumsyn-build-negative-')),candidate=candidateIdentity(),path=join(fixture,'artifacts/build-subject.json');try{
  for(const file of [...candidate.sourceFiles,...candidate.buildFiles]){const target=join(fixture,file.path);mkdirSync(dirname(target),{recursive:true});copyFileSync(file.path,target);}symlinkSync(join(process.cwd(),'node_modules'),join(fixture,'node_modules'),'dir');mkdirSync(dirname(path),{recursive:true});
  for(const missing of [false,true]){if(missing)rmSync(path,{force:true});else writeFileSync(path,JSON.stringify({...JSON.parse(readFileSync('artifacts/build-subject.json')),sourceDigest:'0'.repeat(64)}));
   for(const [runner,status,report] of [['entry-browser.mjs','entry/status.json','entry/report.json'],['workflow-browser.mjs','workflow/status.json','workflow/report.json'],['browser-proofs.mjs','browser/run-status.json','browser/report.json']]){expect(()=>execFileSync(process.execPath,[join(fixture,'scripts',runner)],{cwd:fixture,stdio:'pipe'})).toThrow(missing?'Successful source-bound build stamp absent':'Build does not match current source/artifact');expect(JSON.parse(readFileSync(join(fixture,'artifacts',status))).outcome).toBe('fail');expect(existsSync(join(fixture,'artifacts',report))).toBe(false);}
  }
 }finally{rmSync(fixture,{recursive:true,force:true});}
});
