// B"H
export function adaptInstance(config = {}) { const m = (config.modifiers || []).find(x => x.type === "instance"); return m ? { of:m.of || m.source || config.id, count:m.count || 1 } : null; }
