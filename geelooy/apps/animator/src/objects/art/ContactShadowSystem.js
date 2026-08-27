// B"H
export class ContactShadowSystem { static for(prop = {}) { return { id: `${prop.id}_shadow`, x: prop.x, y: (prop.y || 0) + (prop.size || 12) * 0.65, radiusX: (prop.size || 12) * 0.8, radiusY: 4 }; } }
