import Ajv from 'ajv';
import {addLibraryProduct} from '../persistence/index.js';
const schema={type:'object',required:['schemaVersion','version','country','products'],additionalProperties:false,properties:{schemaVersion:{const:1},version:{type:'string',maxLength:80},country:{const:'IL'},products:{type:'array',minItems:1,maxItems:10000,items:{type:'object',required:['identity','article','name','sourceUrl','dimensions','geometry','provenance','retrieved'],properties:{identity:{type:'string'},article:{type:'string'},name:{type:'string',maxLength:500},sourceUrl:{type:'string',maxLength:2000},retrieved:{type:'string'},dimensions:{type:'object',required:['width','depth','height','unit'],additionalProperties:false,properties:{width:{type:'number',exclusiveMinimum:0},depth:{type:'number',exclusiveMinimum:0},height:{type:'number',exclusiveMinimum:0},unit:{const:'cm'}}},geometry:{const:'generic-table'},provenance:{type:'object',required:['dimensions','geometry'],properties:{dimensions:{const:'source'},geometry:{const:'generic'}}},color:{type:'string'},price:{type:['number','null']},currency:{const:'ILS'}}}}}};
const validate=new Ajv({coerceTypes:false,removeAdditional:false}).compile(schema);
export async function sha256(bytes){const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');}
export function validateCatalog(record){if(!validate(record))throw new Error('Incompatible or malformed catalog');return record;}
export async function loadSeedCatalog(){
 const response=await fetch('./catalog/manifest.json');if(!response.ok)throw new Error('Catalog manifest unavailable');const manifest=await response.json();
 if(manifest.schemaVersion!==1 || !/^[a-f0-9]{64}$/.test(manifest.sha256) || manifest.path!=='./catalog/seed-2026-10-08.json')throw new Error('Unsupported catalog manifest');
 const resource=await fetch(manifest.path);if(!resource.ok)throw new Error('Catalog unavailable');const bytes=await resource.arrayBuffer();if(bytes.byteLength>2_000_000)throw new Error('Catalog exceeds resource limit');
 if(await sha256(bytes)!==manifest.sha256)throw new Error('Catalog content changed; saved versions remain unchanged');
 const record=validateCatalog(JSON.parse(new TextDecoder().decode(bytes)));return {record,hash:manifest.sha256};
}
export async function importProductUrl(input){
 let url;try{url=new URL(input);}catch{throw new Error('Enter a complete IKEA Israel product URL');}
 if(url.protocol!=='https:'||url.hostname!=='www.ikea.com'||!/^\/il\/he\/p\/[a-z0-9-]+-\d{8}\/$/.test(url.pathname))throw new Error('This included seed catalog supports Israeli IKEA product URLs');
 const {record,hash}=await loadSeedCatalog();const product=record.products.find(p=>new URL(p.sourceUrl).pathname===url.pathname);
 if(!product)throw new Error('Not yet in the seed catalog. This fixture is not full IKEA coverage.');
 const snapshot={...structuredClone(product),catalogVersion:record.version,catalogHash:hash};await addLibraryProduct(snapshot);return snapshot;
}
