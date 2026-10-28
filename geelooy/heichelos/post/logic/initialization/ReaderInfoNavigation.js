//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview The reader's accessible Info door and intentional jump navigation.
 * The Awtsmoos unfolds each passage's hidden directions as gentle light;
 * Awtsmoos.com keeps scrolling stable until the learner chooses a flight.
 * One listener per panel, no polling or DOM rebuilding while reading.
 */
import { renderReaderIndexes } from './ReaderInfoList.js';
import {
	findCurrentReaderPassage,
	findReaderOverview,
	jumpToReaderElement,
	resolveReaderJump
} from './ReaderInfoJump.js';

let active = false;

/** Mount an Info menu without changing any existing Sources event handlers. */
export function initReaderInfoNavigation() {
	if (active || typeof document === 'undefined') return false;
	const get = id => document.getElementById(id);
	const button = get('readerInfoBtn');
	const panel = get('readerInfoPanel');
	const backdrop = get('readerInfoBackdrop');
	const index = get('readerTopIndex');
	const sections = get('readerTopSections');
	const subsections = get('readerInfoSubsections');
	const source = get('commentaryBtn');
	const sourceHost = get('readerInfoSourcesHost');
	if (![button, panel, backdrop, index, sections, subsections].every(Boolean)) return false;
	active = true;

	if (source && sourceHost) {
		source.textContent = 'Sources & community';
		sourceHost.append(source);
	}

	const root = () => get('realPost');
	const refresh = () => {
		renderReaderIndexes(root(), sections, subsections);
		return root();
	};
	const close = () => {
		panel.hidden = true;
		backdrop.hidden = true;
		button.setAttribute('aria-expanded', 'false');
	};
	const open = () => {
		refresh();
		panel.hidden = false;
		backdrop.hidden = false;
		button.setAttribute('aria-expanded', 'true');
		get('readerInfoClose')?.focus({ preventScroll: true });
	};
	const jump = target => {
		if (!target) return;
		close();
		jumpToReaderElement(target);
	};

	button.addEventListener('click', () => panel.hidden ? open() : close());
	backdrop.addEventListener('click', close);
	index.addEventListener('toggle', () => {
		if (index.open) refresh();
	});
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && !panel.hidden) close();
	});

	const navigate = event => {
		const target = event.target.closest('button[data-reader-section]');
		if (!target) return false;
		const section = Number(target.dataset.readerSection);
		const pair = target.dataset.readerPair === undefined ? null : Number(target.dataset.readerPair);
		jump(resolveReaderJump(root(), section, pair));
		return true;
	};
	sections.addEventListener('click', navigate);
	subsections.addEventListener('click', navigate);

	panel.addEventListener('click', event => {
		if (event.target.closest('#commentaryBtn')) {
			setTimeout(close, 0);
			return;
		}
		const action = event.target.closest('[data-reader-action]')?.dataset.readerAction;
		if (!action) return;
		if (action === 'close') return close();
		if (action === 'overview') return jump(findReaderOverview(root()));
		if (action === 'current') return jump(findCurrentReaderPassage(root()));
		if (action === 'top') return jump(index);
		if (action === 'sections') {
			index.open = true;
			refresh();
			return jump(index);
		}
		if (action === 'subsections') {
			refresh();
			get('readerSubsectionDetails').open = true;
			get('readerSubsectionDetails').scrollIntoView({ block: 'nearest' });
		}
	});

	const seriesLink = get('readerBrowseSeries');
	if (seriesLink) seriesLink.href = location.pathname.split('/post/')[0] + '/';
	const heichelLink = get('readerBrowseHeichel');
	if (heichelLink) heichelLink.href = location.pathname.split('/series/')[0] + '/';
	return true;
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initReaderInfoNavigation, { once: true });
	} else {
		initReaderInfoNavigation();
	}
}
