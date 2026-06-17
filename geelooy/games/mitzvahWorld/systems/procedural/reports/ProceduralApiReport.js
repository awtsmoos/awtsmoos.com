// B"H
export function proceduralApiReport(response = {}) { return { ok:response.ok === true, id:response.result?.id || response.id || null, primitive:response.result?.geometry?.primitive || null, hasShader:Boolean(response.result?.shader), modifiers:response.result?.geometry?.modifiers?.length || 0 }; }
