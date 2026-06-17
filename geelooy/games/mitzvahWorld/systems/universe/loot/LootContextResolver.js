// B"H
export function resolveLootContext(source = {}, context = {}) { return { sourceId:source.id || context.sourceId || "unknown", sourceType:source.type || context.sourceType || "object", tool:context.tool || null, player:context.player || null, modifiers:context.modifiers || [] }; }
export function contextChance(base, context = {}) { const bonus = (context.modifiers || []).reduce((n,m)=>n+(m.lootBonus || 0), 0); return Math.max(0, Math.min(1, Number(base || 0) + bonus)); }
