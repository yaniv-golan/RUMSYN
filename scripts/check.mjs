import {readdirSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
function walk(p){return readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${p}/${e.name}`):[`${p}/${e.name}`]);}
const files=['packages','scripts','apps','tests'].flatMap(walk).filter(f=>/\.[mc]?js$/.test(f));
for(const f of files){execFileSync(process.execPath,['--check',f]);if(f.startsWith('packages/model/')&&/from\s+['"](?:three|react|.*view)|\b(document|window)\./.test(readFileSync(f,'utf8')))throw new Error('Domain dependency violation '+f);}
console.log(`PASS: syntax ${files.length} files and domain boundary`);
