// B"H
export class HierarchyModel { static fromDocument(doc) { const world = doc.world?.toJSON?.() || doc.world; return { root: doc.id, districts: (world.districts || []).map(d => ({ id: d.id, children: d.children || [] })) }; } }
