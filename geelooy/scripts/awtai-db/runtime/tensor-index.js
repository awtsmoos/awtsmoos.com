// B"H

/**
 * Tensor lookup map for the streaming runtime.
 *
 * A token should not wander the whole manifest every time it asks for a layer
 * weight.  The Awtsmoos arranges names, ids, and role/layer keys once, then
 * the decode path receives the exact vessel without a search storm.
 */
class TensorIndex {
  constructor(manifest) {
    this.byName = new Map();
    this.byId = new Map();
    this.byRoleAny = new Map();
    this.byRoleLayer = new Map();
    for (const tensor of manifest.tensors || []) this.add(tensor);
  }

  add(tensor) {
    this.byName.set(tensor.name, tensor);
    this.byId.set(tensor.id, tensor);
    if (!tensor.role) return;
    if (!this.byRoleAny.has(tensor.role)) this.byRoleAny.set(tensor.role, tensor);
    if (tensor.layer !== null && tensor.layer !== undefined) {
      this.byRoleLayer.set(roleLayerKey(tensor.role, tensor.layer), tensor);
    }
  }

  name(name) {
    return this.byName.get(name) || null;
  }

  id(id) {
    return this.byId.get(id) || null;
  }

  role(role, layer = null) {
    if (layer === null || layer === undefined) return this.byRoleAny.get(role) || null;
    return this.byRoleLayer.get(roleLayerKey(role, layer)) || null;
  }
}

function roleLayerKey(role, layer) {
  return `${role}:${layer}`;
}

module.exports = { TensorIndex };
