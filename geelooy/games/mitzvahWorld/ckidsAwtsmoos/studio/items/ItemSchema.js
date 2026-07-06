// B"H
export function createItem(input = {}) { return { id:input.id || "item", name:input.name || "Item", icon:input.icon || "box", stack:Number(input.stack || 1), price:Number(input.price || 0) }; }
export default { createItem };
