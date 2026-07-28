// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerMobileIdentity
 * @description
 * The Awtsmoos reveals the chosen public voice in one compact row, while the
 * complete Awtsmoos.com alias vessel remains available through an honest button.
 */

/** Installs a compact identity row above the mobile writing tools. */
export function installMobileIdentity(contentBody) {
	const existing = contentBody.querySelector('.composer-mobile-identity');
	if (existing) {
		return existing;
	}
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'composer-mobile-identity';
	button.innerHTML = /*html*/`
		<span class="composer-mobile-avatar" aria-hidden="true">◎</span>
		<span class="composer-mobile-identity-copy">
			<small>Posting identity</small>
			<strong data-mobile-identity-name>Choose an alias</strong>
		</span>
		<span class="composer-mobile-identity-arrow" aria-hidden="true">›</span>
	`;
	button.addEventListener('click', openIdentityPanel);
	const aliasSelect = document.getElementById('aliasSelect');
	aliasSelect?.addEventListener('change', () => updateIdentityName(button));
	contentBody.prepend(button);
	updateIdentityName(button);
	return button;
}

function updateIdentityName(button) {
	const aliasSelect = document.getElementById('aliasSelect');
	const selected = aliasSelect?.selectedOptions?.[0];
	const label = String(selected?.textContent || '').trim();
	button.querySelector('[data-mobile-identity-name]').textContent = label
		|| 'Choose an alias';
}

function openIdentityPanel() {
	const panel = document.querySelector('.identityPanel');
	if (!panel) {
		return;
	}
	panel.open = true;
	panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
