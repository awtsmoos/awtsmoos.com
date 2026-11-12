//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Land a shared section/footnote link on its exact place.
 * A shared link carries its section as ?section=N#sec-NNN and its footnote
 * as ?footnote=M#fn-M (the query is what the server sees for the unfurl;
 * the hash is what the browser jumps to). On load this module waits for
 * the sefer to mount, then scrolls to exactly that section — and to exactly
 * that footnote, opening it through the marker's own click — instead of
 * leaving the reader at the top of the post. It never moves the page for
 * an ordinary load, and it stops the moment the reader scrolls themselves.
 */
import {
	markReaderPairSelected,
	letteredSectionStart
} from './ReaderInfoJump.js?v=reader-info-nested-20261112-3';

/** Parse the section/footnote a shared link asks for (query first, hash next). */
export function requestedReaderDeepLink(loc) {
	const search = loc?.search || '';
	const hash = loc?.hash || '';
	let sectionParam = null;
	let footnoteParam = null;
	try {
		const params = new URLSearchParams(search);
		sectionParam = params.get('section');
		footnoteParam = params.get('footnote');
	} catch (_) { /* no URLSearchParams; fall through to the hash */ }
	const hashSection = /^#sec-(\d{1,4})$/.exec(hash);
	const hashFootnote = /^#fn-(\d{1,4})$/.exec(hash);
	const section = /^\d+$/.test(sectionParam || '')
		? Number(sectionParam)
		: (hashSection ? Number(hashSection[1]) : null);
	const footnote = /^\d+$/.test(footnoteParam || '')
		? footnoteParam
		: (hashFootnote ? hashFootnote[1] : null);
	if (!section && !footnote) return null;
	return { section, footnote };
}

/**
 * B"H batch 49 — find the section element a deep link names. ?section=N
 * is a LETTERED section (1–8: א–ח), so resolve it to that lettered
 * section's OPENING passage first; a bare #sec-NNN hash (no query) still
 * resolves by server id, and an out-of-range number falls back to the
 * passage index (old links).
 */
function findSectionElement(doc, sectionNumber) {
	if (!doc || !sectionNumber) return null;
	const root = doc.getElementById ? doc.getElementById('realPost') : null;
	if (root) {
		const start = letteredSectionStart(root, sectionNumber);
		if (start) return start;
	}
	const byId = doc.getElementById
		? doc.getElementById(`sec-${String(sectionNumber).padStart(3, '0')}`) : null;
	if (byId) return byId;
	const sections = doc.querySelectorAll
		? doc.querySelectorAll('.meluket-sefer-section') : [];
	return sections[sectionNumber - 1] || null;
}

/** Find a footnote marker by its number. */
function findFootnoteMarker(doc, fnNum) {
	if (!doc?.querySelector || !/^\d+$/.test(String(fnNum))) return null;
	return doc.querySelector(`sup[data-fn="${fnNum}"]`);
}

/**
 * Scroll to the requested place once it exists; open the footnote.
 * Polls while the reader boots (at most ~6s), then stops. Returns true
 * when a deep link was requested, false when the URL names nothing.
 */
let activeStop = null;

export function applyReaderDeepLink(doc, loc, win) {
	const target = requestedReaderDeepLink(loc);
	if (!target || !doc || !win) return false;
	if (activeStop) activeStop();
	let cancelled = false;
	let scrolling = false;
	let tries = 0;
	let timer = null;
	let footnoteScrolled = false;
	const onScroll = () => {
		if (!scrolling) cancelled = true;
	};
	win.addEventListener('scroll', onScroll, { passive: true, capture: true });
	const stop = () => {
		win.removeEventListener('scroll', onScroll, { capture: true });
		if (timer) clearInterval(timer);
		if (activeStop === stop) activeStop = null;
	};
	activeStop = stop;
	const scrollTo = (element) => {
		if (!element || typeof element.scrollIntoView !== 'function') return false;
		scrolling = true;
		try {
			element.scrollIntoView({ block: 'start', behavior: 'instant' });
		} catch (_) { /* older engines; the element is still the target */ }
		setTimeout(() => { scrolling = false; }, 100);
		return true;
	};
	/* B"H batch 48 — land the highlight on the section too. The
	   highlight's viewport lookup can land one section off (it reads
	   the viewport centre, the deep link lands the section at the top),
	   and then Previous/Next compute from the wrong place. Marking the
	   landed section's pair keeps navigation in step with the address
	   bar from the first tap. */
	const markLanded = (element) => {
		try {
			const root = doc.getElementById ? doc.getElementById('realPost') : null;
			if (root) markReaderPairSelected(root, element);
		} catch (_) { /* highlight optional; the scroll already landed */ }
	};
	const settleCheck = (element) => {
		setTimeout(() => {
			if (cancelled || !element?.getBoundingClientRect || !doc.contains?.(element)) return;
			let top = 0;
			try { top = element.getBoundingClientRect().top; } catch (_) { return; }
			if (Math.abs(top) > 120) scrollTo(element);
		}, 1200);
	};
	const attempt = () => {
		tries += 1;
		if (cancelled) { stop(); return; }
		if (tries > 30) {
			/* B"H batch 49 — the poll window expired. The footnote
			   marker may be mounted while the click path never became
			   ready (the rendered check saw exactly this: the page
			   scrolled to the passage but no popup opened). Click the
			   marker anyway as a best effort — a tap that opens the
			   popup late is better than a deep link that never opens
			   it — then stop. */
			if (target.footnote) {
				const marker = findFootnoteMarker(doc, target.footnote);
				if (marker) {
					if (scrollTo(marker)) settleCheck(marker);
					markLanded(marker);
					try { marker.click(); } catch (_) { /* popup unavailable */ }
				}
			}
			stop();
			return;
		}
		/* A footnote link lands on its marker AND opens it — but only once
		   the ONE footnote click path is installed, or the tap is lost. */
		if (target.footnote) {
			const marker = findFootnoteMarker(doc, target.footnote);
			const clickPathReady = win.__awtsmoosFnClickPath === true;
			if (marker && clickPathReady) {
				stop();
				if (scrollTo(marker)) settleCheck(marker);
				markLanded(marker);
				try { marker.click(); } catch (_) { /* popup unavailable */ }
				return;
			}
			if (marker) {
				/* B"H batch 49 — the marker is mounted but the click
				   path is not ready yet. Scroll to the passage NOW so
				   the reader is at the right place, and keep polling
				   for the click path (the popup opens when it is
				   ready); the old code waited in silence and the page
				   never visibly moved. */
				if (!footnoteScrolled) {
					footnoteScrolled = true;
					if (scrollTo(marker)) settleCheck(marker);
					markLanded(marker);
				}
				return; /* still waiting on the click path */
			}
		}
		if (target.section) {
			const section = findSectionElement(doc, target.section);
			if (section) {
				stop();
				if (scrollTo(section)) settleCheck(section);
				markLanded(section);
				return;
			}
		}
		/* Not mounted yet — keep polling until the reader settles. */
	};
	timer = setInterval(attempt, 200);
	attempt();
	return true;
}

/** Start on import, once the document is ready (same pattern as the footnote ids). */
function startReaderDeepLink() {
	if (typeof document === 'undefined' || typeof window === 'undefined') return;
	applyReaderDeepLink(document, window.location, window);
	/* A link pasted while the page is already open lands the same way. */
	window.addEventListener('hashchange', () => {
		applyReaderDeepLink(document, window.location, window);
	});
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', startReaderDeepLink, { once: true });
	} else {
		startReaderDeepLink();
	}
}
