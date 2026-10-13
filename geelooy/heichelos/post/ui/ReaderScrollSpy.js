// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderScrollSpy
 * @description
 * The Awtsmoos lets the learner see where they are in the Torah without losing
 * their place; Awtsmoos.com builds a hierarchical table of contents, highlights
 * the current section as you scroll, and restores your position on refresh.
 *
 * Yaakov 2026-10-13: "Should have multiple top-level menus before you see raw
 * content. And SHOULD HAVE AUTO HIGHLIGHT FOR EVERY little section as I scroll,
 * so if you refresh page it re-scrolls to where you were before."
 */

const SCROLL_KEY_PREFIX = 'awtsmoos-reader-scroll:';
const TOC_ID = 'awtsmoos-reader-toc';
const ACTIVE_CLASS = 'toc-active';
const SECTION_HIGHLIGHT_CLASS = 'reader-section-highlight';

/**
 * Initializes the scroll-spy system for a reader page.
 * @param {string} postId Stable post identifier for scroll restoration.
 * @param {HTMLElement} contentRoot Element containing the post content.
 * @param {HTMLElement} tocMount Element where the TOC should be mounted (optional).
 */
export function initReaderScrollSpy(postId, contentRoot, tocMount) {
	if (!postId || !contentRoot) return null;

	const spy = {
		postId,
		contentRoot,
		tocMount: tocMount || null,
		observer: null,
		headings: [],
		saveTimer: null,
		destroyed: false
	};

	// Build TOC from headings
	spy.headings = collectHeadings(contentRoot);
	if (spy.headings.length >= 2) {
		mountToc(spy);
	}

	// Scroll-spy via IntersectionObserver (GPU-friendly, no scroll handler)
	initObserver(spy);

	// Restore scroll position
	restoreScroll(spy);

	// Save scroll position (throttled)
	window.addEventListener('scroll', () => scheduleSave(spy), { passive: true });
	window.addEventListener('beforeunload', () => saveScroll(spy));

	return spy;
}

/** Collects h2/h3 headings and assigns stable IDs. */
function collectHeadings(root) {
	const nodes = root.querySelectorAll('h2, h3');
	const headings = [];
	nodes.forEach((node, index) => {
		if (!node.id) {
			node.id = `reader-section-${index}`;
		}
		// Mark sections for highlighting
		node.classList.add('reader-scroll-target');
		headings.push({
			id: node.id,
			text: node.textContent.trim().slice(0, 80),
			level: node.tagName === 'H2' ? 2 : 3,
			node
		});
	});
	return headings;
}

/** Builds and mounts the hierarchical TOC. */
function mountToc(spy) {
	let toc = document.getElementById(TOC_ID);
	if (!toc) {
		toc = document.createElement('nav');
		toc.id = TOC_ID;
		toc.className = 'reader-toc';
		toc.setAttribute('aria-label', 'Table of contents');
	}
	toc.innerHTML = '';

	const title = document.createElement('h2');
	title.className = 'reader-toc-title';
	title.textContent = 'Contents';
	toc.append(title);

	const list = document.createElement('ol');
	list.className = 'reader-toc-list';

	let currentGroup = null;
	for (const h of spy.headings) {
		const li = document.createElement('li');
		li.className = `reader-toc-item reader-toc-level-${h.level}`;
		li.dataset.sectionId = h.id;

		const link = document.createElement('a');
		link.href = `#${h.id}`;
		link.textContent = h.text;
		link.className = 'reader-toc-link';
		link.addEventListener('click', (e) => {
			e.preventDefault();
			scrollToSection(spy, h.id);
		});

		li.append(link);

		if (h.level === 2) {
			currentGroup = document.createElement('ol');
			currentGroup.className = 'reader-toc-sublist';
			li.append(currentGroup);
			list.append(li);
		} else if (currentGroup) {
			currentGroup.append(li);
		} else {
			list.append(li);
		}
	}

	toc.append(list);

	if (spy.tocMount) {
		spy.tocMount.append(toc);
	} else {
		// Default: insert before content
		spy.contentRoot.parentNode?.insertBefore(toc, spy.contentRoot);
	}

	spy.tocElement = toc;
}

/** Sets up IntersectionObserver for scroll-spy highlighting. */
function initObserver(spy) {
	if (!('IntersectionObserver' in window)) return;

	const options = {
		rootMargin: '-20% 0px -60% 0px',
		threshold: 0
	};

	spy.observer = new IntersectionObserver((entries) => {
		if (spy.destroyed) return;
		for (const entry of entries) {
			if (entry.isIntersecting) {
				setActiveSection(spy, entry.target.id);
			}
		}
	}, options);

	for (const h of spy.headings) {
		spy.observer.observe(h.node);
	}
}

/** Highlights the active section in TOC and content. */
function setActiveSection(spy, sectionId) {
	// Update TOC
	if (spy.tocElement) {
		spy.tocElement.querySelectorAll(`.${ACTIVE_CLASS}`).forEach(el => {
			el.classList.remove(ACTIVE_CLASS);
		});
		const item = spy.tocElement.querySelector(`[data-section-id="${CSS.escape(sectionId)}"]`);
		if (item) {
			item.classList.add(ACTIVE_CLASS);
			// Scroll TOC to show active item
			item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	}

	// Highlight section in content (subtle)
	spy.contentRoot.querySelectorAll(`.${SECTION_HIGHLIGHT_CLASS}`).forEach(el => {
		el.classList.remove(SECTION_HIGHLIGHT_CLASS);
	});
	const heading = document.getElementById(sectionId);
	if (heading) {
		heading.classList.add(SECTION_HIGHLIGHT_CLASS);
	}

	// Update URL hash without jumping
	if (history.replaceState) {
		const url = new URL(window.location.href);
		url.hash = sectionId;
		history.replaceState(null, '', url.toString());
	}
}

/** Smooth scrolls to a section. */
function scrollToSection(spy, sectionId) {
	const target = document.getElementById(sectionId);
	if (!target) return;
	target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	// Offset for fixed headers
	setTimeout(() => {
		window.scrollBy(0, -80);
	}, 100);
	setActiveSection(spy, sectionId);
	saveScroll(spy);
}

/** Returns the localStorage key for this post. */
function scrollKey(postId) {
	return SCROLL_KEY_PREFIX + postId;
}

/** Saves current scroll position (throttled). */
function scheduleSave(spy) {
	if (spy.saveTimer) return;
	spy.saveTimer = setTimeout(() => {
		spy.saveTimer = null;
		saveScroll(spy);
	}, 500);
}

function saveScroll(spy) {
	try {
		const active = spy.tocElement?.querySelector(`.${ACTIVE_CLASS}`)?.dataset.sectionId || '';
		localStorage.setItem(scrollKey(spy.postId), JSON.stringify({
			y: window.scrollY,
			sectionId: active,
			at: Date.now()
		}));
	} catch (e) { /* private mode */ }
}

/** Restores scroll position from previous visit. */
function restoreScroll(spy) {
	try {
		const raw = localStorage.getItem(scrollKey(spy.postId));
		if (!raw) {
			// Check URL hash
			const hash = window.location.hash.slice(1);
			if (hash) {
				setTimeout(() => scrollToSection(spy, hash), 300);
			}
			return;
		}
		const saved = JSON.parse(raw);
		// Only restore if visited within 7 days
		if (Date.now() - saved.at > 7 * 24 * 60 * 60 * 1000) return;

		// Wait for content to settle, then restore
		setTimeout(() => {
			if (saved.sectionId) {
				const target = document.getElementById(saved.sectionId);
				if (target) {
					target.scrollIntoView({ block: 'start' });
					window.scrollBy(0, -80);
					setActiveSection(spy, saved.sectionId);
					return;
				}
			}
			window.scrollTo(0, saved.y || 0);
		}, 400);
	} catch (e) { /* corrupted storage */ }
}

/** Cleans up observers and listeners. */
export function destroyReaderScrollSpy(spy) {
	if (!spy || spy.destroyed) return;
	spy.destroyed = true;
	spy.observer?.disconnect();
	if (spy.saveTimer) clearTimeout(spy.saveTimer);
}
