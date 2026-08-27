/* B"H */
export function createMarkerEngine(input = {}) { return { kind:'MarkerEngine', markers:input.markers || [] }; }
export function addMarker(timeline, marker = {}) { const model = { id:marker.id || `marker-${Date.now()}`, time:Number(marker.time || 0), name:marker.name || 'Marker', chapter:!!marker.chapter, note:marker.note || '' }; timeline.markers.push(model); return model; }
export function removeMarker(timeline, markerId) { const i = timeline.markers.findIndex(m => m.id === markerId); return i >= 0 ? timeline.markers.splice(i, 1)[0] : null; }
