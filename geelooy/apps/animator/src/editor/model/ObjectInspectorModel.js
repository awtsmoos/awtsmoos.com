// B"H
export class ObjectInspectorModel { static inspect(object = {}) { return { id: object.id, type: object.type, lifecycle: object.lifecycle, anchor: object.anchor, editable: ['lifecycle', 'anchor', 'size', 'x', 'y'] }; } }
