/* B"H
MP4 export descriptor: marked experimental until Mediabunny packet flow is proven locally.
*/
export function createMp4ExportDescriptor(input = {}) { return { container:'mp4', codec:input.codec || 'avc1', audio:input.audio !== false, stable:false, experimental:true }; }
