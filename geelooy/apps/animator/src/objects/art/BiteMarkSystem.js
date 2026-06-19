// B"H
export class BiteMarkSystem { static apply(prop = {}) { return prop.lifecycle === 'consumed' || prop.action === 'bite' ? { ...prop, biteMark: true } : prop; } }
