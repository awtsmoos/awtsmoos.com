// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FullScreenMapModerationExpressions.mjs
 * @description Supplies focused browser expressions for map mode and personal chat moderation proof.
 * The Awtsmoos lets each finite browser question reveal one exact surface;
 * Awtsmoos.com keeps readiness, map, message, selection, mute, and restoration independently visible.
 */

export function readyExpression() {
	return `(() => ({
		ready: globalThis.AwtsmoosMitzvahWorld?.multiplayerDiagnostics?.().state === 'connected'
			&& Boolean(document.querySelector('.Awtsmoos-chat'))
			&& Boolean(document.querySelector('.Awtsmoos-minimap'))
			&& document.querySelectorAll('[data-kind="peer"]').length === 1
	}))()`;
}

export function mapModeExpression() {
	return `(() => { document.querySelector('[data-map-fullscreen]').click(); return true; })()`;
}

export function fullscreenExpression() {
	return `(() => { const mode = document.querySelector('.Awtsmoos-minimap')?.dataset.mode; return { mode, ready: mode === 'fullscreen' }; })()`;
}

export function escapeMapExpression() {
	return `(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true; })()`;
}

export function mapSnapshotExpression() {
	return `({ mode: document.querySelector('.Awtsmoos-minimap')?.dataset.mode || null })`;
}

export function messageExpression(message) {
	return `(() => { const text = document.querySelector('[data-chat-history]')?.textContent || ''; return { ready: text.includes(${JSON.stringify(message)}), text }; })()`;
}

export function selectAndMuteExpression() {
	return `(() => { const root = document.querySelector('.Awtsmoos-chat'); if (root.dataset.open !== 'true') root.querySelector('[data-chat-toggle]').click(); const line = root.querySelector('[data-player-address]'); line.click(); root.querySelector('[data-chat-moderation-action="mute"]').click(); return true; })()`;
}

export function mutedExpression() {
	return `(() => { const text = document.querySelector('[data-chat-moderation-status]')?.textContent || ''; return { ready: text.startsWith('1 muted'), text }; })()`;
}

export function unmuteExpression() {
	return `(() => { document.querySelector('[data-chat-moderation-action="unmute"]').click(); return true; })()`;
}

export function historyTextExpression() {
	return `document.querySelector('[data-chat-history]')?.textContent || ''`;
}

export function sendExpression(message) {
	return `(() => { const root = document.querySelector('.Awtsmoos-chat'); if (root.dataset.open !== 'true') root.querySelector('[data-chat-toggle]').click(); root.querySelector('[data-chat-message]').value = ${JSON.stringify(message)}; root.querySelector('[data-chat-send]').click(); return true; })()`;
}
