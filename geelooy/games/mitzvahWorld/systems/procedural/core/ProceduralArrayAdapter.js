// B"H
export function adaptArray(config = {}) { const m = (config.modifiers || []).find(x => x.type === "array"); return m ? { count:m.count || 1, offset:m.offset || [0,0,0] } : null; }
