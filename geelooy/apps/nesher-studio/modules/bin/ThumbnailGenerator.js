/* B"H */
export function createThumbnailGenerator(input = {}) { return { kind:'ThumbnailGenerator', width:input.width || 160, height:input.height || 90 }; }
export function createThumbnailDescriptor(asset, options = {}) { return { id:`thumb-${asset.id}-${options.time ?? 0}`, assetId:asset.id, time:Number(options.time || 0), width:options.width || 160, height:options.height || 90, uri:options.uri || `nesher://thumbnail/${asset.id}/${options.time || 0}` }; }
export function addThumbnail(asset, thumb) { asset.thumbnails ||= []; asset.thumbnails.push(thumb); return thumb; }
