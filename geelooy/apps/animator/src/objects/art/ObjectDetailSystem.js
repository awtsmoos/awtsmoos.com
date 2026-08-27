// B"H
export class ObjectDetailSystem { static apply(prop = {}) { return { ...prop, highlight: true, rim: prop.type === 'apple', detailLevel: prop.size > 18 ? 'medium' : 'small' }; } }
