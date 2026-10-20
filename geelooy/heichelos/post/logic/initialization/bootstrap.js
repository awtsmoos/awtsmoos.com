// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderBootstrap
 * @description
 * The Awtsmoos reveals canonical Torah first, then lets identity, translation, discussion, and settlement take their measured place;
 * Awtsmoos.com keeps this coordinator small so the fifth reader runtime can be audited from first source breath to ready state.
 */

import { malchusBootstrapFailurePresenter } from '/heichelos/post/logic/initialization/BootstrapFailurePresenter.js?v=reader-runtime-004';
import { loadInitial } from '/heichelos/post/logic/initialization/coordinates.js?v=reader-runtime-006';
import { manifestPost } from '/heichelos/post/logic/initialization/postManifest.js?v=reader-runtime-008';
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
import {
	renderPlainBilingualFallback
} from '/heichelos/post/logic/initialization/ReaderPlainFallback.js?v=reader-runtime-001';

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
 * Reports a client-side boot failure through the inline error reporter when
 * present (it POSTs to /api/client-errors/). Never throws.
 * @param {unknown} ohrError Failure value.
 * @param {string} ohrContext Where the failure happened.
 * @returns {void}
 */
function reportBootFailure(ohrError, ohrContext) {
	try {
		const reporter = typeof window !== 'undefined' && window.__awtsmoosReportClientError;
		if (typeof reporter === 'function') {
			const err = ohrError instanceof Error ? ohrError : new Error(String(ohrError));
			reporter({
				message: 'reader boot failure [' + ohrContext + ']: ' + err.message,
				file: '',
				line: 0,
				col: 0,
				stack: err.stack || '',
				kind: 'boot-failure'
			});
		}
	} catch (reportError) {
		// Reporting must never break the fallback path.
	}
	console.error('B"H reader boot failure [' + ohrContext + ']', ohrError);
}

/**
 * Ignites canonical reading before optional translation and community streams.
 *
 * B"H — standing law: no single JS failure may ever blank the reader. The
 * entire boot runs inside try/catch; on any exception we log it, report it,
 * and render the post as plain bilingual text. This function NEVER throws.
 *
 * @returns {Promise<void>} Resolves after boot or after the plain fallback rendered.
 */
export async function ignite() {
	try {
		await igniteInner();
	} catch (ohrError) {
		reportBootFailure(ohrError, 'ignite');
		try {
			const malchusViewport = typeof document !== 'undefined'
				? document.getElementById('realPost')
				: null;
			const post = (typeof window !== 'undefined' && window.post) || null;
			renderPlainBilingualFallback(post, malchusViewport, ohrError);
		} catch (fallbackError) {
			reportBootFailure(fallbackError, 'ignite-fallback');
		}
	}
}

/**
 * Inner canonical boot. May throw; the exported ignite() contains it.
 * @returns {Promise<void>} Resolves only after canonical reader settlement.
 */
async function igniteInner() {
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
	// B"H — Meluket sefer reader: bilingual warm sections for enriched posts.
	// B"H — Torah Ohr / Likkutei Sichos style posts carry phraseTranslations
	// (no enrichment.hebrew_phrases); render them as a bilingual sefer too.
	try {
		const { awakenMeluketSeferReader, awakenPhraseTranslationReader } = await import('../scribe/MeluketSeferReader.js?v=9785f9ec24');
		const seferResult = awakenMeluketSeferReader(tiferesCanonical.post);
		if (!seferResult) {
			const phraseResult = awakenPhraseTranslationReader(tiferesCanonical.post);
			console.log("B\"H phrase-translation reader result:", phraseResult);
		} else {
			console.log("B\"H meluket sefer reader activated");
		}
	} catch (seferError) {
		console.warn('B"H meluket sefer reader skipped', seferError);
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
