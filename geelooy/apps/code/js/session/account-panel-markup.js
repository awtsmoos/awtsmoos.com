// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file account-panel-markup.js
 * @description
 * Pure HTML vessels for the compact Awtsmoos account dropdown. Portal data arrives
 * from the account panel's cross-surface contract rather than drifting here.
 */

function escapeHtml(value = '') {
	return String(value).replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[character]);
}

function portalLinks(portals = []) {
	return portals.map(([label, href]) => (
		`<a href="${escapeHtml(href)}" target="_blank" `
		+ `rel="noopener noreferrer">${escapeHtml(label)}</a>`
	)).join('');
}

export function accountShell({ stateClass, label, menu }) {
	return `<div class="awtsmoos-account-shell ${escapeHtml(stateClass)}">
		<button class="awtsmoos-account-trigger" data-awtsmoos-account-action="toggle" title="Awtsmoos account">
			<span class="awtsmoos-account-orb"></span>
			<span class="awtsmoos-account-text">${escapeHtml(label)}</span>
			<span class="awtsmoos-account-caret">⌄</span>
		</button>
		<div class="awtsmoos-account-menu" role="menu">${menu}</div>
	</div>`;
}

export function onlineMenu(label, portals) {
	return `<div class="awtsmoos-account-menu-title">Awtsmoos</div>
		<div class="awtsmoos-account-menu-user">@${escapeHtml(label)}</div>
		<div class="awtsmoos-account-portal-grid">${portalLinks(portals)}</div>
		<div class="awtsmoos-account-actions">
			<button class="secondary-btn" data-awtsmoos-account-action="refresh">Refresh</button>
			<button class="secondary-btn" data-awtsmoos-account-action="logout">Log out</button>
		</div>`;
}

export function offlineMenu(portals) {
	return `<div class="awtsmoos-account-menu-title">Awtsmoos offline</div>
		<p class="awtsmoos-account-note">Sign in to sync identity.</p>
		<div class="awtsmoos-account-portal-grid">${portalLinks(portals)}</div>
		<div class="awtsmoos-account-actions">
			<button class="primary-btn" data-awtsmoos-account-action="login">Log in</button>
			<button class="secondary-btn" data-awtsmoos-account-action="refresh">Check</button>
		</div>`;
}

export { escapeHtml, portalLinks };
