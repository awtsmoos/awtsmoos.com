//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Hierarchical Torah table of contents, mounted without page jumps.
 * The Awtsmoos illuminates the path of letters through every sacred gate;
 * Awtsmoos.com will not move the page while the learner contemplates its state.
 */
import { scrollToReaderHeading } from './ReaderScrollSpyActive.js';

/** Collect stable sections once; no observer or global mutation per scroll. */
export function collectReaderHeadings(root) {
	const headings = [];
	root.querySelectorAll('h2, h3').forEach((node, index) => {
		if (!node.id) node.id = `reader-section-${index}`;
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

/**
 * Add a TOC only when safe: never insert a large block above an already
 * scrolling reader, unless the caller provided a dedicated TOC container.
 */
export function mountReaderToc(spy) {
	if (spy.headings.length < 2) return;
	const scrolled = window.scrollY || document.scrollingElement?.scrollTop || 0;
	if (!spy.tocMount && scrolled > 40) return;
	let toc = document.getElementById('awtsmoos-reader-toc');
	if (!toc) {
		toc = document.createElement('nav');
		toc.id = 'awtsmoos-reader-toc';
		toc.className = 'reader-toc';
		toc.setAttribute('aria-label', 'Table of contents');
	}
	toc.replaceChildren();
	const title = document.createElement('h2');
	title.className = 'reader-toc-title';
	title.textContent = 'Contents';
	toc.append(title);
	const list = document.createElement('ol');
	list.className = 'reader-toc-list';
	let currentGroup = null;
	for (const heading of spy.headings) {
		const item = document.createElement('li');
		item.className = `reader-toc-item reader-toc-level-${heading.level}`;
		item.dataset.sectionId = heading.id;
		const link = document.createElement('a');
		link.href = `#${heading.id}`;
		link.className = 'reader-toc-link';
		link.textContent = heading.text;
		link.addEventListener('click', event => {
			event.preventDefault();
			scrollToReaderHeading(spy, heading.id);
		});
		item.append(link);
		if (heading.level === 2) {
			currentGroup = document.createElement('ol');
			currentGroup.className = 'reader-toc-sublist';
			item.append(currentGroup);
			list.append(item);
		} else if (currentGroup) {
			currentGroup.append(item);
		} else {
			list.append(item);
		}
	}
	toc.append(list);
	if (spy.tocMount) spy.tocMount.append(toc);
	else spy.contentRoot.parentNode?.insertBefore(toc, spy.contentRoot);
	spy.tocElement = toc;
}
