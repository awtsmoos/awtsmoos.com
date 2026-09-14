// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelFatalState
 * @description
 * The Awtsmoos lets a broken vessel confess its rupture without letting confusion swallow the whole Heichel light;
 * Awtsmoos.com gives failure one accessible card, one retry door, and one safe road back to the wider site.
 */

/** Builds the accessible fatal-state card without mixing it into the boot coordinator. */
export function fatalStateCard(error) {
	const section = document.createElement('section');
	section.className = 'heichel-runtime-state heichel-runtime-state--error';
	section.setAttribute('role', 'alert');
	const kicker = document.createElement('p');
	kicker.className = 'civilization-kicker';
	kicker.textContent = 'Heichel unavailable';
	const title = document.createElement('h1');
	title.textContent = 'The institution could not open.';
	const message = document.createElement('p');
	message.textContent = error?.message
		|| 'An unknown Heichel error occurred.';
	const actions = document.createElement('div');
	actions.className = 'heichel-runtime-state__actions';
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.textContent = 'Try again';
	retry.addEventListener('click', () => location.reload());
	const browse = document.createElement('a');
	browse.href = '/heichelos';
	browse.textContent = 'Browse Heichelos';
	actions.append(retry, browse);
	section.append(kicker, title, message, actions);
	return section;
}

/**
 * Reveals a truthful failure without destroying server-rendered Torah fallback.
 * @param {Error|unknown} error Failure reported by application boot.
 * @returns {void}
 */
export function renderFatalState(error) {
	console.error('B"H - Fatal failure in the Great Manifestation:', error);
	const root = document.querySelector('[data-heichel-render-root]')
		|| document.body;
	const fallback = root.querySelector('[data-heichel-semantic-fallback]');
	const existing = root.querySelector('.heichel-runtime-state--error');
	if (existing) existing.remove();
	const card = fatalStateCard(error);
	if (!fallback) {
		root.replaceChildren(card);
		return;
	}
	fallback.hidden = false;
	fallback.inert = false;
	fallback.setAttribute('aria-hidden', 'false');
	root.querySelector('[data-heichel-client-shell]')?.remove();
	fallback.insertAdjacentElement('afterend', card);
}
