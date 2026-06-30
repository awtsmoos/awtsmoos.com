// B"H
export function createMarquee(surface, start) { const box = document.createElement('div'); box.className = 'desktop-marquee'; surface.appendChild(box); updateMarquee(surface, box, start, start); return box; }
export function updateMarquee(surface, box, start, end) { const r = surface.getBoundingClientRect(); const left = Math.min(start.x, end.x) - r.left, top = Math.min(start.y, end.y) - r.top; Object.assign(box.style, { left:`${left}px`, top:`${top}px`, width:`${Math.abs(end.x - start.x)}px`, height:`${Math.abs(end.y - start.y)}px` }); }
/** B"H: marquee geometry is one module, so tiny orphan boxes can be slain. */
