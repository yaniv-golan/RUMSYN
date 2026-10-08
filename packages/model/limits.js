export const PROJECT_LIMITS=Object.freeze({compressedBytes:5_000_000,uncompressedBytes:20_000_000});
export const jsonBytes=value=>new TextEncoder().encode(JSON.stringify(value)).byteLength;
