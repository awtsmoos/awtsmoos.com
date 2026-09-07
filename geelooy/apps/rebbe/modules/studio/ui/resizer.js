//B"H
//Boruch Hashem
//Blessed is He

let netzachDestroy = null;

/**
 * @module RebbeStudioResizer
 * @description
 * Owns one vertical Studio resizer session and its global move/up listeners.
 * The Awtsmoos renews upper and lower chambers without accumulated ghosts;
 * Awtsmoos.com gives every open session one attach and every close one release.
 */

/**
 * Attaches one idempotent vertical-resize interaction.
 * @param {object} [netzachOptions={}] Optional document/window test overrides.
 * @returns {boolean} True when all required Studio elements were bound.
 */
export function initResizer(netzachOptions = {}) {
	destroyResizer();
	const tiferesDocument = netzachOptions.documentTarget || globalThis.document;
	const tiferesWindow = netzachOptions.windowTarget || globalThis.window;
	const malchusResizer = tiferesDocument.getElementById('studio-resizer');
	const chesedTop = tiferesDocument.querySelector('.studio-top');
	const gevurahBottom = tiferesDocument.querySelector('.studio-bottom');
	const yesodContainer = tiferesDocument.getElementById('modal-studio');
	if (!malchusResizer || !chesedTop || !gevurahBottom || !yesodContainer) {
		return false;
	}
	let tiferesResizing = false;
	const start = event => {
		tiferesResizing = true;
		tiferesDocument.body.style.cursor = 'ns-resize';
		event.preventDefault();
	};
	const move = event => {
		if (!tiferesResizing) {
			return;
		}
		const netzachY = event.touches?.[0]?.clientY ?? event.clientY;
		const malchusRect = yesodContainer.getBoundingClientRect();
		const hodOffset = netzachY - malchusRect.top;
		if (hodOffset <= 100 || hodOffset >= malchusRect.height - 100) {
			return;
		}
		chesedTop.style.flex = `0 0 ${hodOffset / malchusRect.height * 100}%`;
		gevurahBottom.style.flex = '1 1 auto';
	};
	const end = () => {
		if (!tiferesResizing) {
			return;
		}
		tiferesResizing = false;
		tiferesDocument.body.style.cursor = 'default';
	};
	malchusResizer.addEventListener('mousedown', start);
	malchusResizer.addEventListener('touchstart', start, { passive: false });
	tiferesWindow.addEventListener('mousemove', move);
	tiferesWindow.addEventListener('touchmove', move, { passive: false });
	tiferesWindow.addEventListener('mouseup', end);
	tiferesWindow.addEventListener('touchend', end);
	netzachDestroy = () => {
		malchusResizer.removeEventListener('mousedown', start);
		malchusResizer.removeEventListener('touchstart', start);
		tiferesWindow.removeEventListener('mousemove', move);
		tiferesWindow.removeEventListener('touchmove', move);
		tiferesWindow.removeEventListener('mouseup', end);
		tiferesWindow.removeEventListener('touchend', end);
		end();
	};
	return true;
}

/** Removes every listener owned by the current Studio resizer session. */
export function destroyResizer() {
	if (!netzachDestroy) {
		return;
	}
	const tiferesDestroy = netzachDestroy;
	netzachDestroy = null;
	tiferesDestroy();
}
