// B"H
export class ColliderBindingRuntime { constructor(bindings = []) { this.bindings = bindings; } snapshot() { return { bindings:this.bindings.length, missing:this.bindings.filter(b=>!b.collider).length }; } }
export default ColliderBindingRuntime;
