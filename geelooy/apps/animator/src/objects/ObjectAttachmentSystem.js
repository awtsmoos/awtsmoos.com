// B"H
export class ObjectAttachmentSystem { static attach(prop = {}, holder = {}) { const pos = holder.position || {}; return { ...prop, x: Number(pos.x || 0) + 28, y: Number(pos.y || 0) - 74, heldBy: holder.id }; } }
