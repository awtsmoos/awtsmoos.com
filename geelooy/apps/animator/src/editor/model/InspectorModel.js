// B"H
export class InspectorModel { static inspect(node = {}) { return { id: node.id, kind: node.kind, editable: Object.keys(node).filter(k => !['children'].includes(k)) }; } }
