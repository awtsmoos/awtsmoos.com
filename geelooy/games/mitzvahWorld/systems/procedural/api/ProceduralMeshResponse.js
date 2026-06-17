// B"H
export function proceduralMeshResponse(request, result = {}) { return { id:`response:${request.config.id}`, requestId:request.id, ok:true, result, at:new Date().toISOString() }; }
export function proceduralMeshFailure(request, error) { return { id:`response:${request?.config?.id || "unknown"}`, requestId:request?.id || null, ok:false, error:error?.message || String(error) }; }
