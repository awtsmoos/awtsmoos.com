// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachNativeStatus
 * @description
 * The Awtsmoos distinguishes waiting, absence, and failure so silence never pretends to be truth;
 * Awtsmoos.com gives native English a small honest vessel while Hebrew remains the living root.
 */

const STATUS_SELECTOR = '[data-tanach-native-status]';
const STYLE_HREF = '/heichelos/post/translations/tanach/status.css?v=tanach-native-003';

function ensureStatusStyle() {
	if (document.querySelector(`link[href="${STYLE_HREF}"]`)) {
		return;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = STYLE_HREF;
	document.head.append(link);
}

function statusText(state) {
	if (state === 'loading') {
		return 'Loading native Awtsmoos English…';
	}
	if (state === 'unavailable') {
		return 'Native Awtsmoos English is unavailable for this exact range.';
	}
	return 'Native Awtsmoos English could not be loaded.';
}

export function clearNativeTanachStatus(viewport) {
	viewport?.querySelector(STATUS_SELECTOR)?.remove();
}

/**
 * Render one compact source state without covering the Torah.
 * @param {HTMLElement} viewport Reader viewport.
 * @param {'loading'|'unavailable'|'error'} state Source state.
 * @param {Function|null} retry Optional retry callback.
 */
export function renderNativeTanachStatus(viewport, state, retry = null) {
	if (!viewport) {
		return null;
	}
	ensureStatusStyle();
	clearNativeTanachStatus(viewport);
	const vessel = document.createElement('div');
	vessel.className = `awtsmoos-tanach-source-status is-${state}`;
	vessel.dataset.tanachNativeStatus = state;
	vessel.setAttribute('role', state === 'error' ? 'alert' : 'status');
	const message = document.createElement('span');
	message.textContent = statusText(state);
	vessel.append(message);
	if (state === 'error' && typeof retry === 'function') {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Retry';
		button.addEventListener('click', retry, { once: true });
		vessel.append(button);
	}
	viewport.prepend(vessel);
	return vessel;
}
