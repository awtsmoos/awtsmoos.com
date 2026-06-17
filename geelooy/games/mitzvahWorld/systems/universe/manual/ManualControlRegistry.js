// B"H
export class ManualControlRegistry { constructor() { this.controls = new Map(); } register(command) { this.controls.set(command.id, command.manual || {}); return command; } snapshot() { return { controls:this.controls.size, ids:[...this.controls.keys()] }; } }
export default ManualControlRegistry;
