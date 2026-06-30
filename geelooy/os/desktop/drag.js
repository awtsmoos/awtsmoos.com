// B"H
import { applyPosition, rectsIntersect, snap } from './layout.js';
import { savePositions } from './storage.js';
export function bindDesktopDrag({ surface, positions, selection }) {
  let drag = null;
  surface.addEventListener('pointerdown', event => { if (event.button !== 0) return; const icon = event.target.closest?.('.desktop-icon'); icon ? startIconDrag(event, icon) : startMarquee(event); });
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  function startIconDrag(event, icon) { icon.setPointerCapture?.(event.pointerId); const ids = selection.has(icon.dataset.id) ? selection.ids() : [icon.dataset.id]; selection.replace(ids); drag = { kind:'icons', x:event.clientX, y:event.clientY, ids, start:Object.fromEntries(ids.map(id => [id, { ...positions[id] }])) }; }
  function startMarquee(event) { surface.focus(); selection.clear(); const box = document.createElement('div'); box.className = 'desktop-marquee'; surface.appendChild(box); drag = { kind:'marquee', x:event.clientX, y:event.clientY, box }; }
  function move(event) { if (!drag) return; drag.kind === 'icons' ? moveIcons(event) : moveMarquee(event); }
  function moveIcons(event) { const dx = event.clientX - drag.x, dy = event.clientY - drag.y; drag.ids.forEach(id => { positions[id] = snap({ x:drag.start[id].x + dx, y:drag.start[id].y + dy }, surface); applyPosition(surface.querySelector(`[data-id="${id}"]`), positions[id]); }); surface.classList.add('desktop-dragging'); }
  function moveMarquee(event) { const r = surface.getBoundingClientRect(); const left = Math.min(drag.x, event.clientX) - r.left, top = Math.min(drag.y, event.clientY) - r.top; const width = Math.abs(event.clientX - drag.x), height = Math.abs(event.clientY - drag.y); Object.assign(drag.box.style, { left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px` }); const box = drag.box.getBoundingClientRect(); selection.replace([...surface.querySelectorAll('.desktop-icon')].filter(node => rectsIntersect(box, node.getBoundingClientRect())).map(node => node.dataset.id)); }
  function up() { if (!drag) return; if (drag.kind === 'icons') savePositions(positions); drag.box?.remove(); surface.classList.remove('desktop-dragging'); drag = null; }
}
/** B"H: Drag is the hand moving vessels; marquee is a cloud selecting sparks. */
