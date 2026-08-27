/* B"H */
export function createH264Encoder(input = {}) { return { kind:'H264Encoder', codec:input.codec || 'avc1.42E01F', width:input.width || 1280, height:input.height || 720, bitrate:input.bitrate || 2500000, framerate:input.framerate || 30, hardwareAcceleration:input.hardwareAcceleration || 'prefer-hardware' }; }
export function h264ConfigFromPreset(preset = {}) { return createH264Encoder({ width:preset.width, height:preset.height, bitrate:preset.videoBitrate, framerate:preset.fps }); }
