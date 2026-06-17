// B"H
export class ColliderRegistry { constructor() { this.colliders = new Map(); } add(collider) { this.colliders.set(collider.id, collider); return collider; } addAll(items = []) { return items.map(i => this.add(i)); } snapshot() { return { total:this.colliders.size, ids:[...this.colliders.keys()] }; } }
export default ColliderRegistry;
