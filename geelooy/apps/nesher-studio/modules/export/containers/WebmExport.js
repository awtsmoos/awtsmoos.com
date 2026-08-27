/* B"H
WebM export descriptor: stable manual path remains the default vessel.
*/
export function createWebmExportDescriptor(input = {}) { return { container:'webm', codec:input.codec || 'vp8', audio:input.audio !== false, stable:true }; }
