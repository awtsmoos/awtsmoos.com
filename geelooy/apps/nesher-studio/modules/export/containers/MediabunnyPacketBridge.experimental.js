/* B"H
Experimental packet bridge: a sealed doorway until real browser mux proof blesses it.
*/
export const MEDIABUNNY_PACKET_BRIDGE_EXPERIMENTAL = true;
export function createExperimentalPacketBridge({ enabled = false } = {}) {
  return { enabled, packets:[], add(packet){ if (!enabled) throw new Error('experimental packet bridge disabled'); this.packets.push(packet); }, summary(){ return { enabled, packets:this.packets.length }; } };
}
