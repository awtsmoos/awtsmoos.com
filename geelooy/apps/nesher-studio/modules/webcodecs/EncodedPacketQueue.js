/* B"H */
export function createEncodedPacketQueue(input = {}) { return { kind:'EncodedPacketQueue', maxPackets:input.maxPackets || 300, packets:input.packets || [], dropped:0, bytes:0 }; }
export function enqueuePacket(queue, packet = {}) { const model = { type:packet.type || 'video', timestamp:Number(packet.timestamp || 0), duration:Number(packet.duration || 0), byteLength:Number(packet.byteLength || packet.bytes?.byteLength || packet.bytes || 0), key:!!packet.key }; queue.packets.push(model); queue.bytes += model.byteLength; while (queue.packets.length > queue.maxPackets) { const gone = queue.packets.shift(); queue.bytes -= gone.byteLength; queue.dropped += 1; } return model; }
export function dequeuePacket(queue) { const packet = queue.packets.shift() || null; if (packet) queue.bytes -= packet.byteLength; return packet; }
export function queueDuration(queue) { const ts = queue.packets.map(p => p.timestamp); return ts.length ? Math.max(...ts) - Math.min(...ts) : 0; }
