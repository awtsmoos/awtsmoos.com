/* B"H
WebM target: Malchus holds the final bytes until a Blob is born.
*/
export async function createArrayBufferTarget(module) { return new module.ArrayBufferTarget(); }
export function targetBuffer(target) { return target?.buffer || new ArrayBuffer(0); }
