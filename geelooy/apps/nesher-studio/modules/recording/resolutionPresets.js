/* B"H
Resolution presets: the stage chooses a garment, yet the Awtsmoos remains beyond size.
When the user asks for 720p, 1080p, vertical flame, or custom breath,
this small vessel turns desire into integer pixels without guessing.
*/
export const CUSTOM_PRESET_ID = 'custom';
export const RESOLUTION_PRESETS = [
  { id:'hd', label:'HD 720p', width:1280, height:720 },
  { id:'full-hd', label:'Full HD 1080p', width:1920, height:1080 },
  { id:'qhd', label:'QHD 1440p', width:2560, height:1440 },
  { id:'uhd', label:'4K UHD', width:3840, height:2160 },
  { id:'square', label:'Square 1080×1080', width:1080, height:1080 },
  { id:'vertical', label:'Vertical 1080×1920', width:1080, height:1920 },
  { id:CUSTOM_PRESET_ID, label:'Custom', custom:true }
];

export function presetOptionsHtml(presets = RESOLUTION_PRESETS) {
  return presets.map(preset => `<option value="${preset.id}">${preset.label}</option>`).join('');
}

export function findPresetBySize(width, height, presets = RESOLUTION_PRESETS) {
  const size = sanitizeSize({ width, height });
  return presets.find(preset => !preset.custom && preset.width === size.width && preset.height === size.height) || null;
}

export function presetIdForSize(width, height, presets = RESOLUTION_PRESETS) {
  return findPresetBySize(width, height, presets)?.id || CUSTOM_PRESET_ID;
}

export function sizeForPreset(id, fallback = {}, presets = RESOLUTION_PRESETS) {
  const preset = presets.find(item => item.id === id);
  if (!preset || preset.custom) return sanitizeSize(fallback);
  return sanitizeSize(preset);
}

export function sanitizeSize(input = {}) {
  return {
    width: sanitizeDimension(input.width, 1280, 320),
    height: sanitizeDimension(input.height, 720, 240),
    fps: sanitizeDimension(input.fps, 30, 1, 60)
  };
}

function sanitizeDimension(value, fallback, min, max = 7680) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}
