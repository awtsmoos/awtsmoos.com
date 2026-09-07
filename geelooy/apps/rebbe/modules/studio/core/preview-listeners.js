//B"H
//Boruch Hashem
//Blessed is He

let netzachDestroy = null;

/**
 * @module RebbeStudioPreviewListeners
 * @description
 * Owns one browser-event session for Studio preview gestures without importing
 * rendering or canvas code. The Awtsmoos renews every listener from nothing;
 * Awtsmoos.com keeps attachment and release measurable, idempotent, and testable.
 */

/**
 * Attaches one preview listener session and replaces any previous session.
 * @param {HTMLElement} malchusWrapper Preview wrapper receiving start/wheel events.
 * @param {Window|EventTarget} tiferesWindow Global move/up event target.
 * @param {object} yesodGesture Gesture controller consumed by listener callbacks.
 * @returns {boolean} True when all required dependencies were present.
 */
export function attachPreviewListeners(malchusWrapper, tiferesWindow, yesodGesture) {
	detachPreviewListeners();
	if (!malchusWrapper || !tiferesWindow || !yesodGesture) {
		return false;
	}
	const handlers = createHandlers(yesodGesture);
	malchusWrapper.addEventListener('mousedown', handlers.mouseDown);
	malchusWrapper.addEventListener('touchstart', handlers.touchStart, { passive: false });
	malchusWrapper.addEventListener('wheel', handlers.wheel, { passive: false });
	tiferesWindow.addEventListener('mousemove', handlers.mouseMove);
	tiferesWindow.addEventListener('touchmove', handlers.touchMove, { passive: false });
	tiferesWindow.addEventListener('mouseup', handlers.end);
	tiferesWindow.addEventListener('touchend', handlers.end);
	netzachDestroy = () => {
		malchusWrapper.removeEventListener('mousedown', handlers.mouseDown);
		malchusWrapper.removeEventListener('touchstart', handlers.touchStart);
		malchusWrapper.removeEventListener('wheel', handlers.wheel);
		tiferesWindow.removeEventListener('mousemove', handlers.mouseMove);
		tiferesWindow.removeEventListener('touchmove', handlers.touchMove);
		tiferesWindow.removeEventListener('mouseup', handlers.end);
		tiferesWindow.removeEventListener('touchend', handlers.end);
		yesodGesture.end();
	};
	return true;
}

/** Removes every listener owned by the active preview session. */
export function detachPreviewListeners() {
	if (!netzachDestroy) {
		return;
	}
	const tiferesDestroy = netzachDestroy;
	netzachDestroy = null;
	tiferesDestroy();
}

/** @returns {object} Stable event callbacks for one listener session. */
function createHandlers(yesodGesture) {
	return {
		mouseDown(event) {
			yesodGesture.start(event.clientX, event.clientY);
		},
		touchStart(event) {
			if (event.touches.length === 1) {
				yesodGesture.start(event.touches[0].clientX, event.touches[0].clientY);
			}
		},
		mouseMove(event) {
			yesodGesture.move(event.clientX, event.clientY);
		},
		touchMove(event) {
			if (event.touches.length !== 1 || !yesodGesture.isActive()) {
				return;
			}
			event.preventDefault();
			yesodGesture.move(event.touches[0].clientX, event.touches[0].clientY);
		},
		wheel(event) {
			event.preventDefault();
			yesodGesture.zoom(event.deltaY);
		},
		end() {
			yesodGesture.end();
		}
	};
}
