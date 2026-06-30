// B"H
import { applyPosition, rectsIntersect, snap } from './layout.js';
import { savePositions } from './storage.js';
import { isMobileDesktop } from './mobile.js';
import { createMarquee, updateMarquee } from './selectionOverlay.js';
import { isDesktopLocked } from './lockMode.js';
import { notifyDesktop } from './notifications.js';
export function bindDesktopDrag({ os, surface, positions, selection }) {
  let drag = null;
  surface.addEventListener('pointerdown', event => { if (event.button !== 0 && event.pointerType === 'mouse') return; const icon = event.target.closest?.('.desktop-icon'); icon ? startIconDrag(event, icon) : startMarquee(event); });
  window.addEventListener('pointermove', move, { passive:false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  function startIconDrag(event, icon) { if (isDesktopLocked()) { selection.select(icon.dataset.id); notifyDesktop(os, 'Desktop is locked; unlock to move icons', 'info'); return; } icon.setPointerCapture?.(event.pointerId); const ids = selection.has(icon.dataset.id) ? selection.ids() : [icon.dataset.id]; selection.replace(ids); drag = { kind:'icons', moved:false, mobile:isMobileDesktop(surface), x:event.clientX, y:event.clientY, ids, start:Object.fromEntries(ids.map(id => [id, { ...positions[id] }])) }; }
  function startMarquee(event) { if (isMobileDesktop(surface)) { selection.clear(); return; } surface.focus(); selection.clear(); drag = { kind:'marquee', x:event.clientX, y:event.clientY, box:createMarquee(surface, { x:event.clientX, y:event.clientY }) }; }
  function move(event) { if (!drag) return; if (event.cancelable) event.preventDefault(); drag.kind === 'icons' ? moveIcons(event) : moveMarquee(event); }
  function moveIcons(event) { const dx = event.clientX - drag.x, dy = event.clientY - drag.y; drag.moved ||= Math.hypot(dx, dy) > 8; drag.ids.forEach(id => { positions[id] = snap({ x:drag.start[id].x + dx, y:drag.start[id].y + dy }, surface); applyPosition(surface.querySelector(`[data-id="${id}"]`), positions[id]); }); surface.classList.add('desktop-dragging'); }
  function moveMarquee(event) { updateMarquee(surface, drag.box, { x:drag.x, y:drag.y }, { x:event.clientX, y:event.clientY }); const box = drag.box.getBoundingClientRect(); selection.replace([...surface.querySelectorAll('.desktop-icon')].filter(node => rectsIntersect(box, node.getBoundingClientRect())).map(node => node.dataset.id)); }
  function up() { if (!drag) return; if (drag.kind === 'icons' && drag.moved) savePositions(positions, drag.mobile); drag.box?.remove(); surface.classList.remove('desktop-dragging'); drag = null; }
}
/** B"H: drag now obeys lock mode and explains itself instead of failing silently. */
