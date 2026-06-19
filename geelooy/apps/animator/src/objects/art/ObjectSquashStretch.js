// B"H
export class ObjectSquashStretch { static scale(prop = {}) { const s = Number(prop.squash || 0); return { scaleX: 1 + s, scaleY: 1 - s * 0.65 }; } }
