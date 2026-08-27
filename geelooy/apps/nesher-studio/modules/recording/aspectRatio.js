/* B"H
Aspect ratios: the canvas changes garments without tearing its shape.
Locked by default; custom freedom waits behind an explicit unlock.
*/
export const CUSTOM_RATIO_ID = 'custom';
export const ASPECT_RATIOS = [
  { id:'16:9', label:'16:9 Landscape', width:16, height:9 },
  { id:'9:16', label:'9:16 Vertical', width:9, height:16 },
  { id:'1:1', label:'1:1 Square', width:1, height:1 },
  { id:'4:3', label:'4:3 Classic', width:4, height:3 },
  { id:'21:9', label:'21:9 Cinema', width:21, height:9 },
  { id:CUSTOM_RATIO_ID, label:'Custom/current', custom:true }
];

export function aspectOptionsHtml(ratios = ASPECT_RATIOS) {
  return ratios.map(ratio => `<option value="${ratio.id}">${ratio.label}</option>`).join('');
}

export function ratioValue(id, width = 16, height = 9) {
  const ratio = ASPECT_RATIOS.find(item => item.id === id);
  if (ratio && !ratio.custom) return ratio.width / ratio.height;
  const w = Math.max(1, Number(width || 16));
  const h = Math.max(1, Number(height || 9));
  return w / h;
}

export function sizeWithLockedAspect({ width, height, changed = 'width', ratio = 16 / 9 }) {
  const w = Math.max(320, Math.round(Number(width || 1280)));
  const h = Math.max(240, Math.round(Number(height || 720)));
  if (changed === 'height') return { width:Math.max(320, Math.round(h * ratio)), height:h };
  return { width:w, height:Math.max(240, Math.round(w / ratio)) };
}

export function ratioIdForSize(width, height) {
  const actual = ratioValue(CUSTOM_RATIO_ID, width, height);
  const match = ASPECT_RATIOS.find(item => !item.custom && Math.abs(item.width / item.height - actual) < 0.01);
  return match?.id || CUSTOM_RATIO_ID;
}
