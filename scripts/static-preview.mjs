import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {digest} from './gate.mjs';
export async function serveCandidate(candidate,{prefix='/RUMSYN/'}={}){
 const files=new Map(candidate.buildFiles.map(f=>[f.path.replace(/^dist\//,''),f.sha256]));
 const server=createServer((req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}const relative=decodeURIComponent(pathname.slice(prefix.length))||'index.html';if(!files.has(relative)){res.writeHead(404);res.end();return;}const bytes=readFileSync(`dist/${relative}`);if(digest(bytes)!==files.get(relative))throw new Error('Candidate bytes changed during serving');const ext=relative.slice(relative.lastIndexOf('.'));res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.ttf':'font/ttf'}[ext]??'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);}catch(e){res.writeHead(500);res.end(e.message);}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 return {url:`http://127.0.0.1:${server.address().port}${prefix}`,close:()=>new Promise(resolve=>server.close(resolve))};
}
