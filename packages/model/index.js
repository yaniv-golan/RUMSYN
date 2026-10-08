import {parseMeasurement} from './units.js';
import {validateRoom} from './room.js';
export const SCHEMA_VERSION = 2;
export const TOLERANCE_CM = 1e-6;
export function clone(value) { return structuredClone(value); }
export function dimension(value, field = 'dimension') {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${field}: expected a positive finite dimension in cm`);
  return value;
}
export function measurement(value, source = 'entered') {
  dimension(value);
  if (!['entered', 'derived', 'inferred', 'adjusted'].includes(source)) throw new Error('Unknown measurement provenance');
  return {value, unit: 'cm', source};
}
export function parseLength(input) {
  if(typeof input!=='string'||!/(?:cm|mm|m|in|ft|[\'"′″])\s*$/i.test(input))throw new Error('Enter an explicit measurement unit');
  return dimension(parseMeasurement(input));
}
export function validateState(state) {
  if (![1,SCHEMA_VERSION].includes(state.schemaVersion) || !Number.isSafeInteger(state.revision) || state.revision < 0) throw new Error('Invalid model version/revision');
  if (!Array.isArray(state.walls) || !Array.isArray(state.attachments)) throw new Error('Missing walls/attachments');
  const ids = new Set();
  for (const wall of state.walls) {
    if (typeof wall.id !== 'string' || !wall.id || ids.has(wall.id)) throw new Error('Invalid/duplicate wall ID');
    ids.add(wall.id);if(wall.locked!==undefined&&typeof wall.locked!=='boolean')throw new Error('Invalid wall length lock');
    dimension(wall.length.value);
    if (wall.length.unit !== 'cm' || !['entered','derived','inferred','adjusted'].includes(wall.length.source)) throw new Error('Invalid measurement record');
  }
  for (const item of state.attachments) {
    if (typeof item.id !== 'string' || !item.id || ids.has(item.id)) throw new Error('Invalid/duplicate attachment ID');
    ids.add(item.id);
    const wall = state.walls.find(w => w.id === item.wallId);
    if (!wall || !Number.isFinite(item.offset) || item.offset < 0 || !['start','end'].includes(item.anchor)) throw new Error('Invalid attachment host/anchor');
    dimension(item.width);
    if(item.height!==undefined){dimension(item.height);if(!Number.isFinite(item.bottom)||item.bottom<0||item.bottom+item.height>wall.height+TOLERANCE_CM)throw new Error('Opening height/elevation no longer fits its wall');}
    if (item.offset + item.width > wall.length.value + TOLERANCE_CM) throw new Error('Opening no longer fits its wall');
  }
  return validateRoom(state);
}
