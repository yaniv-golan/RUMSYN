export const SCHEMA_VERSION = 1;
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
  const match = /^\s*(\d+(?:\.\d+)?)\s*(cm|mm|m|in|ft)\s*$/.exec(input);
  if (!match) throw new Error('Enter a positive number with cm, mm, m, in, or ft');
  return dimension(Number(match[1]) * {cm:1, mm:0.1, m:100, in:2.54, ft:30.48}[match[2]]);
}
export function validateState(state) {
  if (state.schemaVersion !== SCHEMA_VERSION || !Number.isSafeInteger(state.revision) || state.revision < 0) throw new Error('Invalid model version/revision');
  if (!Array.isArray(state.walls) || !Array.isArray(state.attachments)) throw new Error('Missing walls/attachments');
  const ids = new Set();
  for (const wall of state.walls) {
    if (typeof wall.id !== 'string' || !wall.id || ids.has(wall.id)) throw new Error('Invalid/duplicate wall ID');
    ids.add(wall.id);
    dimension(wall.length.value);
    if (wall.length.unit !== 'cm' || !['entered','derived','inferred','adjusted'].includes(wall.length.source)) throw new Error('Invalid measurement record');
  }
  for (const item of state.attachments) {
    if (typeof item.id !== 'string' || !item.id || ids.has(item.id)) throw new Error('Invalid/duplicate attachment ID');
    ids.add(item.id);
    const wall = state.walls.find(w => w.id === item.wallId);
    if (!wall || !Number.isFinite(item.offset) || item.offset < 0 || !['start','end'].includes(item.anchor)) throw new Error('Invalid attachment host/anchor');
    dimension(item.width);
    if (item.offset + item.width > wall.length.value + TOLERANCE_CM) throw new Error('Opening no longer fits its wall');
  }
  return state;
}
