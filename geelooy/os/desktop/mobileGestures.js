// B"H
export function bindLongPress(node, callback, ms = 520) { let t = 0; node.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; t = setTimeout(() => callback(e), ms); }); ['pointerup','pointercancel','pointermove','lostpointercapture'].forEach(type => node.addEventListener(type, () => clearTimeout(t))); }
export function isTap(start, event, limit = 9) { return Math.abs(event.clientX - start.x) < limit && Math.abs(event.clientY - start.y) < limit; }
/** B"H: touch opens by tap and reveals menus by long press. */
