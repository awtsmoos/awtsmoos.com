//B"H
//Boruch Hashem
//Blessed is He

import state from '../../modules/state.js';

/**
 * @module RebbeModalActionBindings
 * @description
 * Owns destructive confirmations, video actions, Studio exit, and ordinary
 * modal closing. The Awtsmoos is beyond opening and closing; Awtsmoos.com keeps
 * each finite modal action explicit so no hidden layer can silently lose its path.
 */

/**
 * Binds stable modal actions idempotently.
 * @param {object} tiferesCallbacks Application callbacks supplied by main.js.
 * @returns {void}
 */
export function bindModalActions(tiferesCallbacks = {}) {
	bindDestructiveActions(tiferesCallbacks);
	bindVideoActions(tiferesCallbacks);
	bindStudioExit(tiferesCallbacks);
	bindOrdinaryCloseActions(tiferesCallbacks);
}

/** Connects the two destructive operations behind explicit confirmation. */
function bindDestructiveActions(tiferesCallbacks) {
	const malchusBookshelfClear = document.getElementById('btn-bookshelf-clear');
	if (malchusBookshelfClear) {
		malchusBookshelfClear.onclick = () => {
			if (confirm('CLEAR ALL BOOKMARKS?')) {
				tiferesCallbacks.onClearBookshelf?.();
			}
		};
	}
	const gevurahCacheClear = document.getElementById('btn-action-clear');
	if (gevurahCacheClear) {
		gevurahCacheClear.onclick = () => {
			if (confirm('DELETE ALL CACHED AUDIO?')) {
				tiferesCallbacks.onClearDB?.();
			}
		};
	}
}

/** Connects video analysis and audio-slice download to their current form values. */
function bindVideoActions(tiferesCallbacks) {
	const netzachAnalyze = document.getElementById('btn-generate-analyze');
	if (netzachAnalyze) {
		netzachAnalyze.onclick = () => {
			const tiferesStart = parseFloat(document.getElementById('vid-start')?.value || 0);
			const yesodDuration = parseFloat(document.getElementById('vid-duration')?.value || 15);
			const malchusResolution = document.getElementById('vid-res')?.value;
			tiferesCallbacks.onAnalyzeVideo?.(tiferesStart, yesodDuration, malchusResolution);
		};
	}
	const hodDownload = document.getElementById('btn-download-audio');
	if (hodDownload) {
		hodDownload.onclick = () => tiferesCallbacks.onDownloadAudioSlice?.(state);
	}
}

/** Ensures Studio EXIT always invokes full Studio teardown rather than generic hiding. */
function bindStudioExit(tiferesCallbacks) {
	const malchusExit = document.getElementById('btn-close-studio');
	if (malchusExit) {
		malchusExit.onclick = () => tiferesCallbacks.onCloseStudio?.();
	}
}

/** Binds ordinary modal close buttons and backdrop clicks without intercepting Studio EXIT. */
function bindOrdinaryCloseActions(tiferesCallbacks) {
	document.querySelectorAll('.modal-close').forEach(malchusButton => {
		if (malchusButton.id !== 'btn-close-studio') {
			malchusButton.onclick = () => closeOrdinaryModals(tiferesCallbacks);
		}
	});
	const yesodOverlay = document.getElementById('overlay-layer');
	if (yesodOverlay) {
		yesodOverlay.onclick = event => {
			if (event.target === yesodOverlay) {
				closeOrdinaryModals(tiferesCallbacks);
			}
		};
	}
}

/** Closes visible modal surfaces while preserving explicit Studio teardown semantics. */
function closeOrdinaryModals(tiferesCallbacks) {
	const malchusStudio = document.getElementById('modal-studio');
	if (malchusStudio && !malchusStudio.classList.contains('hidden') && tiferesCallbacks.onCloseStudio) {
		tiferesCallbacks.onCloseStudio();
		return;
	}
	document.querySelectorAll('.modal').forEach(malchusModal => {
		malchusModal.classList.add('hidden');
	});
	document.getElementById('overlay-layer')?.classList.add('hidden');
}
