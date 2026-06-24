/* B"H */
export function createThumbnailExporter(input = {}) { return { kind:'ThumbnailExporter', format:input.format || 'png', width:input.width || 1280, height:input.height || 720, time:Number(input.time || 0) }; }
export function describeThumbnailArtifact(job, options = {}) { return { kind:'thumbnail', name:`${job.id || 'export'}-${options.time || 0}.${options.format || 'png'}`, mime:`image/${options.format || 'png'}`, status:'descriptor-only' }; }
