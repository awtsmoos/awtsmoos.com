/* B"H */
export function createTrackMattes(input = {}) { return { kind:'TrackMattes', enabled:input.enabled ?? true, matteTrackId:input.matteTrackId || null, mode:input.mode || 'alpha' }; }
export function resolveMatte(matte, tracks = []) { return tracks.find(t => t.id === matte.matteTrackId) || null; }
