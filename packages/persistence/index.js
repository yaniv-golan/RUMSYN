import {PROJECT_LIMITS} from '../model/limits.js';
import Dexie from 'dexie';
import {projectArchiveBytes} from './archive.js';
import {zipSync,strToU8,strFromU8} from 'fflate';
import {migrateSessionV1} from '../model/migration.js';
import {CommandSession} from '../commands/index.js';
import Ajv from 'ajv';
const ajv=new Ajv({allErrors:true,coerceTypes:false,removeAdditional:false});
const validate=ajv.compile({type:'object',required:['format','version','session'],additionalProperties:false,properties:{format:{const:'RUMSYN'},version:{enum:[1,2]},session:{type:'object',required:['state','history','cursor'],additionalProperties:false,properties:{state:{type:'object'},history:{type:'array'},cursor:{type:'integer',minimum:0}}}}});
function decode(document){if(![1,2].includes(document?.version))throw new Error(`Unsupported project version ${document?.version??'missing'}`);if(typeof document?.session?.state?.id!=='string'||!document.session.state.id)throw new Error('Missing project identity');if(document?.session?.state?.walls?.length && !document.session.state.room)throw new Error('Legacy proof-only state is not a portable room');if(!validate(document))throw new Error('Unsupported or malformed project format');if(document.version===2&&[document.session.state,...document.session.history.flatMap(e=>[e.before,e.after])].some(s=>s?.schemaVersion!==2))throw new Error('Project2 requires model schema2');const session=CommandSession.reopen(JSON.stringify(document.version===1?migrateSessionV1(document.session):document.session));session.importedVersion=document.version;return session;}
export function projectDocument(session){return {format:'RUMSYN',version:2,session:session.state.schemaVersion===1?migrateSessionV1(JSON.parse(session.serialize())):JSON.parse(session.serialize())};}
export function exportProject(session){const bytes=strToU8(JSON.stringify(projectDocument(session)));if(bytes.byteLength>PROJECT_LIMITS.uncompressedBytes)throw new Error('Project exceeds the portable resource budget');const archive=zipSync({'project.json':bytes},{level:6});if(archive.byteLength>PROJECT_LIMITS.compressedBytes)throw new Error('Compressed project exceeds the portable resource budget');return archive;}
export function importProject(bytes){
 if(bytes.byteLength>PROJECT_LIMITS.compressedBytes)throw new Error('Project exceeds 5 MB compressed limit');
 return decode(JSON.parse(strFromU8(projectArchiveBytes(bytes))));
}
let database;
export function db(){if(!database){database=new Dexie('rumsyn-m1');database.version(1).stores({recovery:'id',library:'identity'});database.version(2).stores({recovery:'id',library:'identity',plugins:'id'});}return database;}
export async function recover(){const record=await db().recovery.get('current');return record?decode(record.document):null;}
export async function saveRecovery(session){await db().transaction('rw',db().recovery,()=>db().recovery.put({id:'current',document:projectDocument(session)}));}
export async function addLibraryProduct(product){await db().library.put({identity:product.identity,product:structuredClone(product)});}
export async function libraryProducts(){return (await db().library.toArray()).map(r=>r.product);}
