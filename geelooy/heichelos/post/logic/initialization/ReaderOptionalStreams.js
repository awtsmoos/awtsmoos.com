// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderOptionalStreams
 * @description
 * The Awtsmoos lets translation and community discussion flow beside canonical Torah without owning its readiness gate;
 * Awtsmoos.com catches each optional river locally so a social or English shadow can never darken the source state.
 */

import { mountDiscussion } from '/heichelos/post/social/discussion.js?v=social-reborn-007';
import { mountPostTranslations } from '/heichelos/post/translations/controller.js?v=translation-reader-015';

/**
 * Starts optional discussion and records its independent runtime state.
 * B"H 2026-11-19 (social polish): the discussion no longer depends on the
 * caller's boot sequence completing. It waits — bounded — for the post
 * context its API root needs, mounts regardless after the deadline so a
 * slow or failed manifest can never leave a silent absence, and any
 * failure lands a visible fallback with a retry instead of only a
 * console warning.
 * @param {HTMLElement} viewport Canonical reader viewport.
 * @returns {void}
 */
export function beginDiscussion(viewport) {
	document.body.dataset.socialDiscussionState = 'loading';
	mountDiscussionWhenReady(viewport)
		.then(() => {
			document.body.dataset.socialDiscussionState = 'ready';
		})
		.catch((ohrError) => {
			document.body.dataset.socialDiscussionState = 'failed';
			console.warn(
				'B"H social discussion loaded safely later',
				ohrError
			);
			showDiscussionFallback(viewport);
		});
}

/**
 * Waits (bounded) for window.post — set by loadInitial — because the
 * discussion API root is built from it, then mounts the discussion.
 * After the deadline it mounts anyway: mountDiscussion renders its own
 * honest error state with a retry when the context is still missing.
 * @param {HTMLElement} viewport Canonical reader viewport.
 * @returns {Promise<object>} The mounted discussion section.
 */
async function mountDiscussionWhenReady(viewport) {
	await waitForPostContext();
	return mountDiscussion(viewport);
}

function waitForPostContext() {
	const deadline = Date.now() + 30000;
	return new Promise((resolve) => {
		const check = () => {
			if (window.post?.heichel?.id && window.post?.id) {
				resolve(true);
				return;
			}
			if (Date.now() >= deadline) {
				resolve(false);
				return;
			}
			setTimeout(check, 200);
		};
		check();
	});
}

/**
 * The never-silent guarantee: if mounting failed before its section
 * landed, append a plain visible fallback with a working retry.
 * @param {HTMLElement} viewport Canonical reader viewport.
 * @returns {void}
 */
function showDiscussionFallback(viewport) {
	if (!viewport || document.getElementById('awtsmoos-social-discussion')) {
		return;
	}
	const section = document.createElement('section');
	section.className = 'awtsmoos-social-discussion awtsmoos-social-discussion-fallback';
	const message = document.createElement('p');
	message.textContent = 'Comments could not be loaded right now.';
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.className = 'btn awtsmoos-social-retry';
	retry.textContent = 'Retry';
	retry.addEventListener('click', () => {
		section.remove();
		beginDiscussion(viewport);
	});
	section.append(message, retry);
	viewport.appendChild(section);
}

/**
 * Starts optional translation without delaying canonical reading.
 * @param {HTMLElement} viewport Canonical reader viewport.
 * @param {object} post Canonical post object.
 * @param {object} series Canonical parent series.
 * @param {string} heichelId Canonical Heichel identifier.
 * @returns {void}
 */
export function beginTranslation(viewport, post, series, heichelId) {
	void mountPostTranslations({
		viewport,
		post,
		series,
		heichelId
	}).catch((ohrError) => {
		console.warn(
			'B"H translation reader remained optional',
			ohrError
		);
	});
}
