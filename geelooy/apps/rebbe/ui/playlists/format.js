//B"H

/**
 * B"H
 * Formatting helpers polish raw values before they enter the visible palace.
 * Their job is small, but without them every label leaks chaos.
 */
export function esc(value) { return String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }
export function date(value) { return value ? new Date(value).toLocaleDateString() : 'never'; }
export function fmtBytes(bytes) { if (!bytes) return '0 B'; const units = ['B', 'KB', 'MB', 'GB']; let i = 0, n = bytes; while (n > 1024 && i < units.length - 1) { n /= 1024; i++; } return `${n.toFixed(i ? 1 : 0)} ${units[i]}`; }
export function fmtTime(seconds) { const s = Math.round(seconds || 0); return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`; }
export function art(playlist = {}) { return esc(playlist.artwork ? '▣' : String((playlist.title || 'P')[0]).toUpperCase()); }
export function css(value) { return globalThis.CSS?.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, '\\$&'); }
