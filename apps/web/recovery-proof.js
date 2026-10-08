import {CommandSession} from '../../packages/commands/index.js';
import {measurement} from '../../packages/model/index.js';
const database='rumsyn-m0-recovery-proof';
function open(){return new Promise((resolve,reject)=>{const request=indexedDB.open(database,1);request.onupgradeneeded=()=>request.result.createObjectStore('recovery');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function saveRecoveryProof(){
 const session=new CommandSession({schemaVersion:1,revision:0,walls:[{id:'D',length:measurement(306)}],attachments:[{id:'window',wallId:'D',width:91,offset:105,anchor:'start'}]});
 const proposal=session.previewWallLength('D',307);session.apply(proposal.id);
 const db=await open();try{await new Promise((resolve,reject)=>{const tx=db.transaction('recovery','readwrite');tx.objectStore('recovery').put(session.serialize(),'project');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??new Error('Recovery aborted'));});}finally{db.close();}
 return {saved:307,history:1,limitations:['quota/two-tab/migration qualification not_run','temporary raw IndexedDB harness; production Dexie not selected']};
}
export async function reopenRecoveryProof(){
 const db=await open();let json;try{json=await new Promise((resolve,reject)=>{const tx=db.transaction('recovery','readonly'),r=tx.objectStore('recovery').get('project');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}
 const session=CommandSession.reopen(json);const saved=session.state.walls[0].length.value;session.undo();return {saved,undone:session.state.walls[0].length.value,attachment:session.state.attachments[0],provenance:session.state.walls[0].length.source};
}
