// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderBootstrap
 * @description
 * The Awtsmoos reveals canonical Torah first, then lets identity, translation, discussion, and settlement take their measured place;
 * Awtsmoos.com keeps this coordinator small so the fourth reader runtime can be audited from first source breath to ready state.
 */

import { malchusBootstrapFailurePresenter } from '/heichelos/post/logic/initialization/BootstrapFailurePresenter.js?v=reader-runtime-004';
import { loadInitial } from '/heichelos/post/logic/initialization/coordinates.js?v=reader-runtime-004';
import { manifestPost } from '/heichelos/post/logic/initialization/postManifest.js?v=reader-runtime-004';
import { createReaderPanels } from '/heichelos/post/logic/initialization/readerPanels.js?v=reader-runtime-004';
import { hydrateReaderIdentity } from '/heichelos/post/logic/initialization/ReaderIdentityHydrator.js?v=reader-runtime-004';
import {
	prepareReaderBehavior,
	settleCoreReader
} from '/heichelos/post/logic/initialization/ReaderCoreSettlement.js?v=reader-runtime-004';
import {
	beginDiscussion,
	beginTranslation
} from '/heichelos/post/logic/initialization/ReaderOptionalStreams.js?v=reader-runtime-004';

/**
 * Manifests the authoritative post and returns the canonical context needed by optional streams.
 * @param {HTMLElement} viewport Reader viewport receiving canonical content.
 * @param {HTMLElement} sidebar Reader sidebar receiving interaction panels.
 * @returns {Promise<object>} Canonical post, series, and Heichel context.
 */
async function manifestCanonicalReader(viewport, sidebar) {
	const { post, series, hId, pIdx } = await loadInitial();
	window.post = post;
	await hydrateReaderIdentity(post, hId);
	window.tabRefs = createReaderPanels(sidebar);
	prepareReaderBehavior();
	window.__awtsmoosPostRenderMode = await manifestPost(
		viewport,
		post,
		series,
		pIdx
	);
	return {
		post,
		series,
		hId
	};
}

/**
 * Ignites canonical reading before optional translation and community streams.
 * @returns {Promise<void>} Resolves only after canonical reader settlement.
 */
export async function ignite() {
	console.log(
		'%c B"H - Commencing Social Reader',
		'color: #ccff00; font-weight: 900;'
	);
	const malchusViewport = document.getElementById('realPost');
	const malchusSidebar = document.querySelector('.sidebar');
	let tiferesCanonical;
	try {
		tiferesCanonical = await manifestCanonicalReader(
			malchusViewport,
			malchusSidebar
		);
	} catch (ohrError) {
		malchusBootstrapFailurePresenter.reveal(
			malchusViewport,
			ohrError
		);
		throw ohrError;
	}
	beginTranslation(
		malchusViewport,
		tiferesCanonical.post,
		tiferesCanonical.series,
		tiferesCanonical.hId
	);
	document.body.dataset.socialReaderReady = 'true';
	beginDiscussion(malchusViewport);
	await settleCoreReader();
}
