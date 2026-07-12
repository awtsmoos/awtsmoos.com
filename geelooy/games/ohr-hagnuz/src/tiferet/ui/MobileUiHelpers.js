/** B"H @module MobileUiHelpers - escaped HTML and shared touch helpers. */
export const HOLD_INTENTS = new Set(['U', 'D', 'L', 'R']);
export const PULSE_FRAMES = 5;
export const titleCase = key => String(key).replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
export const escapeHtml = value => String(value ?? '').replace(/[&<>"]/g, character => ({
	'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
}[character]));
export const rowHtml = (label, value) => `<p><b>${escapeHtml(label)}</b><span>${escapeHtml(value)}</span></p>`;
export const buttonHtml = item => `<button class="ohr-touch ${item.className || ''}" data-intent="${item.intent || ''}" data-action="${item.action || ''}" aria-label="${item.text || item.label}"><span>${item.label}</span>${item.text ? `<small>${item.text}</small>` : ''}</button>`;
export const ensureIntents = () => (window.AwtsmoosIntents ||= { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 });
