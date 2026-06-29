// B"H
export function inputEvent(type, data = {}) { return { id:`input:${Date.now().toString(36)}`, type, data, at:new Date().toISOString() }; }
