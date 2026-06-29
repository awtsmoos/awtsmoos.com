// B"H
export function sessionRecord(input = {}) { return { id:input.id || `session:${Date.now().toString(36)}`, user:input.user || "current", display:input.display || "display:main", createdAt:new Date().toISOString() }; }
