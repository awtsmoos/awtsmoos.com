// B"H
export class SefirosWorldState { constructor(seed = {}) { this.state = { packets:[], ...seed }; } add(packet) { this.state.packets.push(packet); return packet; } snapshot() { return { ...this.state, packets:[...this.state.packets] }; } }
export default SefirosWorldState;
