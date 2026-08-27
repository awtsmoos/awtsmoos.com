/* B"H
Worker mux bridge: encoded chunks cross boundaries as neutral packets.
*/
export function createWorkerMuxPacket(kind, chunk, metadata = {}) {
  return { kind, timestamp:chunk?.timestamp ?? 0, duration:chunk?.duration ?? 0, byteLength:chunk?.byteLength ?? 0, metadata };
}
export function summarizeMuxPackets(packets = []) {
  return packets.reduce((sum, p) => { sum[p.kind] = (sum[p.kind] || 0) + 1; sum.bytes += p.byteLength || 0; return sum; }, { bytes:0 });
}
