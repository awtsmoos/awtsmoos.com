//B"H
// Boruch Hashem
// Blessed is He

const FULL_STYLE_ID = 'awtsmoos-reader-feature-styles';
const FULL_STYLE_URL = '/heichelos/post/styles/main.css?v=reader-features-002';
const SETTINGS_STYLE_ID = 'awtsmoos-reader-settings-styles';
const SETTINGS_STYLE_URL = '/heichelos/post/styles/reader-settings.css?v=reader-settings-001';
const COMMENTS_STYLE_ID = 'awtsmoos-reader-comments-styles';
const COMMENTS_STYLE_URL = '/feed/css/anchoredComments.css?v=1';
const FALLBACK_DELAY_MS = 8000;
const FALLBACK_IDLE_TIMEOUT_MS = 3000;

/**
 * Creates one stylesheet vessel and returns the existing vessel on repeated calls.
 * @param {Document} documentRef Active reader document.
 * @param {string} id Stable stylesheet id.
 * @param {string} href Stylesheet URL.
 * @returns {HTMLLinkElement|null} Stylesheet vessel.
 */
function ensureStyle(documentRef, id, href) {
	if (!documentRef?.head) return null;
	const existing = documentRef.getElementById(id);
	if (existing) return existing;
	const link = documentRef.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = href;
	link.dataset.readerFeatureStyles = 'loading';
	link.addEventListener('load', () => {
		link.dataset.readerFeatureStyles = 'ready';
	}, { once: true });
	documentRef.head.appendChild(link);
	return link;
}

/** Opens only the typography/settings garment. */
export function ensureReaderSettingsStyles(documentRef = globalThis.document) {
	if (documentRef?.getElementById(FULL_STYLE_ID)) {
		return documentRef.getElementById(FULL_STYLE_ID);
	}
	return ensureStyle(documentRef, SETTINGS_STYLE_ID, SETTINGS_STYLE_URL);
}

/** Loads the complete interaction graph and removes the now-redundant settings bundle. */
export function ensureReaderFeatureStyles(documentRef = globalThis.document) {
	const link = ensureStyle(documentRef, FULL_STYLE_ID, FULL_STYLE_URL);
	if (!link || link.dataset.readerCleanupArmed === '1') return link;
	link.dataset.readerCleanupArmed = '1';
	link.addEventListener('load', () => {
		documentRef.getElementById(SETTINGS_STYLE_ID)?.remove();
	}, { once: true });
	return link;
}

/** Loads the complete Sources world, including anchored comment styling. */
export function ensureReaderCommentaryStyles(documentRef = globalThis.document) {
	ensureStyle(documentRef, COMMENTS_STYLE_ID, COMMENTS_STYLE_URL);
	return ensureReaderFeatureStyles(documentRef);
}

/**
 * Arms intent-first feature CSS with a deliberately delayed full fallback.
 * The Awtsmoos lets Aa stay light while Sources may awaken its larger world.
 */
export function armReaderFeatureStyles(
	documentRef = globalThis.document,
	runtime = globalThis.window
) {
	if (!documentRef?.addEventListener || documentRef.documentElement?.dataset.readerFeatureStylesArmed === '1') return;
	documentRef.documentElement.dataset.readerFeatureStylesArmed = '1';
	const awakenFromIntent = (event) => {
		const target = event.target?.closest?.('#typographyBtn, #commentaryBtn');
		if (!target) return;
		if (target.id === 'typographyBtn') {
			ensureReaderSettingsStyles(documentRef);
			return;
		}
		ensureReaderCommentaryStyles(documentRef);
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
