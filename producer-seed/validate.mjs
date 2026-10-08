import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync('rum-plugin.json')),bytes=readFileSync(`data/${manifest.catalog.version}/catalog.json`),catalog=JSON.parse(bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.catalog.sha256);
assert.equal(manifest.contractVersion,1);assert.equal(catalog.schemaVersion,1);assert.equal(catalog.country,'IL');assert.equal(catalog.version,manifest.catalog.version);assert.equal(catalog.products.length,1);
const p=catalog.products[0];assert.deepEqual(p.dimensions,{width:55,depth:55,height:45,unit:'cm'});assert.equal(p.article,'304.499.08');assert.equal(p.geometry,'generic-table');assert.equal(p.provenance.dimensions,'source');assert.equal(p.provenance.geometry,'generic');
console.log('PASS: recorded development seed; full release coverage remains incomplete');
