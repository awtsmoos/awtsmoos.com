// B"H
export class ObjectState { static make(p = {}) { return { id: p.id, type: p.type || p.propType || 'object', lifecycle: p.lifecycle || 'placed', anchor: p.anchor || 'table', heldBy: p.heldBy || null, x: p.x || 0, y: p.y || 0, size: p.size || 14 }; } }
