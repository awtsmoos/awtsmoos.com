//B"H
// Boruch Hashem
// Blessed is He

const FEATURE_STYLE_ID = 'awtsmoos-reader-feature-styles';
const FEATURE_STYLE_URL = '/heichelos/post/styles/main.css?v=reader-features-001';
const FEATURE_INTENT_SELECTOR = '#typographyBtn, #commentaryBtn';
const FALLBACK_DELAY_MS = 8000;
const FALLBACK_IDLE_TIMEOUT_MS = 3000;

/**
 * Loads hidden reader chambers only when their worlds are about to be revealed.
 * The Awtsmoos gives passive Torah the first road; settings and discussion follow intent.
 * @param {Document} documentRef Active reader document.
 * @returns {HTMLLinkElement|null} The feature stylesheet vessel.
 */
export function ensureReaderFeatureStyles(documentRef = globalThis.document) {
	if (!documentRef?.head) {
		return null;
	}
	const existing = documentRef.getElementById(FEATURE_STYLE_ID);
	if (existing) {
		return existing;
	}
	const link = documentRef.createElement('link');
	link.id = FEATURE_STYLE_ID;
	link.rel = 'stylesheet';
	link.href = FEATURE_STYLE_URL;
	link.dataset.readerFeatureStyles = 'loading';
	link.addEventListener('load', () => {
		link.dataset.readerFeatureStyles = 'ready';
	}, { once: true });
	documentRef.head.appendChild(link);
	return link;
}

/**
 * Arms interaction-first loading with a deliberately delayed idle fallback.
 * @param {Document} documentRef Active reader document.
 * @param {Window} runtime Browser runtime.
 * @returns {void}
 */
export function armReaderFeatureStyles(
	documentRef = globalThis.document,
	runtime = globalThis.window
) {
	if (!documentRef?.addEventListener || documentRef.documentElement?.dataset.readerFeatureStylesArmed === '1') {
		return;
	}
	documentRef.documentElement.dataset.readerFeatureStylesArmed = '1';
	const awakenFromIntent = (event) => {
		if (!event.target?.closest?.(FEATURE_INTENT_SELECTOR)) {
			return;
		}
		ensureReaderFeatureStyles(documentRef);
		documentRef.removeEventListener('pointerdown', awakenFromIntent, true);
		documentRef.removeEventListener('focusin', awakenFromIntent, true);
	};
	documentRef.addEventListener('pointerdown', awakenFromIntent, true);
	documentRef.addEventListener('focusin', awakenFromIntent, true);
	const scheduleFallback = () => {
		const awaken = () => ensureReaderFeatureStyles(documentRef);
		const afterDelay = () => {
			if (runtime?.requestIdleCallback) {
				runtime.requestIdleCallback(awaken, { timeout: FALLBACK_IDLE_TIMEOUT_MS });
				return;
			}
			awaken();
		};
		runtime?.setTimeout?.(afterDelay, FALLBACK_DELAY_MS);
	};
	if (documentRef.readyState === 'complete') {
		scheduleFallback();
		return;
	}
	runtime?.addEventListener?.('load', scheduleFallback, { once: true });
}
