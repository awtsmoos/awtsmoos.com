//B"H
//Boruch Hashem
//Blessed is He

import { openModal } from '../modals.js';
import { updatePlayIcon } from '../player.js';

/**
 * @module RebbePrimaryControlBindings
 * @description
 * Restores the stable visible transport and navigation covenant without owning
 * Search or Terminal. The Awtsmoos, Atzmus beyond button and callback, renews
 * every doorway; Awtsmoos.com keeps each finite control bound to one messenger,
 * so Studio, transport, sharing, settings, and return paths remain manifest.
 */

/**
 * Binds primary controls idempotently through their onclick property.
 * @param {object} tiferesCallbacks Application callbacks supplied by main.js.
 * @returns {void}
 */
export function bindPrimaryControls(tiferesCallbacks = {}) {
	bindPlayback(tiferesCallbacks);
	bindTransport(tiferesCallbacks);
	bindStudio(tiferesCallbacks);
	bindSeeker(tiferesCallbacks);
	bindHeaderActions(tiferesCallbacks);
	bindBackActions(tiferesCallbacks);
}

/** Connects play/pause while keeping the icon synchronized with actual state. */
function bindPlayback(tiferesCallbacks) {
	const malchusPlay = document.getElementById('btn-play');
	if (!malchusPlay) {
		return;
	}
	malchusPlay.onclick = event => {
		event.stopPropagation();
		tiferesCallbacks.onPlayPause?.();
		updatePlayIcon(tiferesCallbacks.isPlaying?.());
	};
}

/** Connects previous and next archive transport controls. */
function bindTransport(tiferesCallbacks) {
	const netzachNext = document.getElementById('btn-next');
	if (netzachNext) {
		netzachNext.onclick = () => tiferesCallbacks.onNext?.();
	}
	const hodPrevious = document.getElementById('btn-prev');
	if (hodPrevious) {
		hodPrevious.onclick = () => tiferesCallbacks.onPrev?.();
	}
}

/** Connects the visible Studio doorway without coupling it to Studio internals. */
function bindStudio(tiferesCallbacks) {
	const yesodStudio = document.getElementById('btn-slice');
	if (!yesodStudio) {
		return;
	}
	yesodStudio.title = 'Studio / video tools';
	yesodStudio.setAttribute('aria-label', 'Studio / video tools');
	yesodStudio.onclick = event => {
		event.stopPropagation();
		tiferesCallbacks.onOpenSliceModal?.();
	};
}

/** Converts a finite pointer position into the historical 0..1 seek fraction. */
function bindSeeker(tiferesCallbacks) {
	const malchusSeeker = document.getElementById('player-seeker');
	if (!malchusSeeker) {
		return;
	}
	malchusSeeker.onclick = event => {
		const tiferesRect = malchusSeeker.getBoundingClientRect();
		const netzachFraction = Math.max(0, Math.min(1, (event.clientX - tiferesRect.left) / tiferesRect.width));
		tiferesCallbacks.onSeekFraction?.(netzachFraction);
	};
}

/** Connects Bookshelf, Share, and Settings while Search remains independently owned. */
function bindHeaderActions(tiferesCallbacks) {
	const malchusBookshelf = document.getElementById('btn-bookshelf');
	if (malchusBookshelf) {
		malchusBookshelf.onclick = () => tiferesCallbacks.onOpenBookshelf?.();
	}
	const tiferesShare = document.getElementById('btn-share');
	if (tiferesShare) {
		tiferesShare.onclick = () => tiferesCallbacks.onShare?.();
	}
	const gevurahSettings = document.getElementById('btn-settings');
	if (gevurahSettings) {
		gevurahSettings.onclick = () => openModal('modal-settings');
	}
}

/** Connects both narrow-screen back controls to the browser controller callback. */
function bindBackActions(tiferesCallbacks) {
	for (const malchusId of ['back-tracks', 'back-folders']) {
		const yesodBack = document.getElementById(malchusId);
		if (yesodBack) {
			yesodBack.onclick = () => tiferesCallbacks.onBack?.();
		}
	}
}
