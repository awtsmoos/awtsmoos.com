/* B"H
Mediabunny guards: Gevurah checks the names before the stream begins.
*/
export const HLS_EXPORTS = ['Output','HlsOutputFormat','MpegTsOutputFormat','PathedTarget','BufferTarget','CanvasSource'];
export function requireMediabunnyExports(module, names = HLS_EXPORTS) {
  const missing = names.filter(name => !module?.[name]);
  if (missing.length) throw new Error(`mediabunny_missing_${missing.join('_')}`);
  return true;
}
