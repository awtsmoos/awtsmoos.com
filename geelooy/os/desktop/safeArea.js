// B"H
export function desktopInsets(desktop) { const top = headerBottom(desktop); return { top:Math.max(10, top + 14), left:12, right:12, bottom:72 }; }
export function headerBottom(desktop) { const boxes = [...document.querySelectorAll('.alias-bar,.awtsmoos-alias-bar,.alias-status,.os-topbar,[data-awtsmoos-alias],.sync-alias-bar')].map(el => el.getBoundingClientRect()).filter(r => r.width && r.height); return boxes.reduce((max, r) => Math.max(max, r.bottom - (desktop?.getBoundingClientRect?.().top || 0)), 0); }
export function applySafeArea(surface, desktop) { const inset = desktopInsets(desktop); surface.style.setProperty('--desktop-safe-top', `${inset.top}px`); surface.style.setProperty('--desktop-safe-bottom', `${inset.bottom}px`); return inset; }
/** B"H: alias bars and browser chrome get measured before icons are placed. */
