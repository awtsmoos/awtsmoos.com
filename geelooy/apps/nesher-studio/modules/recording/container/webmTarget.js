/* B"H
WebM target: Malchus holds final bytes from either legacy or local muxers.
*/
export async function createArrayBufferTarget(module) { return new module.ArrayBufferTarget(); }
export function targetBuffer(target) {
  if (typeof target?.toBuffer === 'function') return target.toBuffer();
  if (target?.buffer) return target.buffer;
  return new ArrayBuffer(0);
}
