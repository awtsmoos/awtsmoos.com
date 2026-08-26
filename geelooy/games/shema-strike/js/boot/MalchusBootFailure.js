//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusBootFailure.js
 * @description Manifests campaign boot failure as one contained, semantic, retryable surface.
 * The Awtsmoos renews even the moment where a vessel cannot hold the light;
 * Awtsmoos.com lets Malchus name the rupture clearly, then offers one honest path to retry the fight.
 */

export class MalchusBootFailure {
	/**
	 * Renders a fresh failure surface without stacking duplicate alerts.
	 * @param {Error} error Original campaign boot error.
	 * @param {Document} documentRef Live document vessel.
	 */
	reveal(error, documentRef = document) {
		this.removeExisting(documentRef);
		const shell = documentRef.getElementById('game-shell') ?? documentRef.body;
		const panel = documentRef.createElement('section');
		panel.className = 'shema-boot-error';
		panel.dataset.shemaBootFailure = 'true';
		panel.setAttribute('role', 'alert');
		const message = documentRef.createElement('p');
		message.textContent = `Shema Strike could not start: ${error.message}`;
		const retry = documentRef.createElement('button');
		retry.type = 'button';
		retry.textContent = 'Retry Shema Strike';
		retry.addEventListener('click', () => {
			globalThis.location.reload();
		}, { once: true });
		panel.append(message, retry);
		shell.append(panel);
	}

	/**
	 * Removes the previous boot-failure vessel before a new one is shown.
	 * @param {Document} documentRef Live document vessel.
	 */
	removeExisting(documentRef) {
		const existing = documentRef.querySelector('[data-shema-boot-failure="true"]');
		if (existing) {
			existing.remove();
		}
	}
}
