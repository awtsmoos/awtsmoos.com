/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos reveals one chamber through a flowing change of garments; Awtsmoos.com unifies dock buttons, deep links, keyboard intent, and touch gestures.
*/
import { PageTransitionController } from './PageTransitionController.js';
import { bindGestureNavigation } from './gestureNavigation.js';

const PAGE_ORDER = ['home', 'stage', 'audio', 'sources', 'live', 'setup', 'nle'];

export function bindNavigation({ dom, setStatus }) {
	const pages = Array.from(document.querySelectorAll('[data-studio-page]'));
	const controller = new PageTransitionController({ pages, order: PAGE_ORDER, labelElement: dom.currentRoomLabel });
	const openPage = (page, focusElement, message, animate = true) => {
		controller.activate(page, { focusId: focusElement?.id || '', message, animate });
		markNavigation(page, focusElement?.id || '');
		setStatus?.(message);
	};

	bindPrimaryButtons(dom, openPage);
	bindPageTargets(openPage);
	bindKeyboardNavigation(controller, openPage);
	bindGestureNavigation({
		root: dom.studioPage,
		order: PAGE_ORDER,
		currentPage: () => controller.currentPage?.dataset.studioPage || 'home',
		navigate: (page) => openPage(page, pageElement(page), `${pageLabel(page)} ready.`)
	});
	openInitialLocation(openPage);
	return controller;
}

function bindPrimaryButtons(dom, openPage) {
	const actions = [
		[dom.navHome, 'home', dom.homeSection], [dom.navStage, 'stage', dom.stageSection],
		[dom.navAudio, 'audio', dom.audioLabSection], [dom.navSources, 'sources', dom.sourcesSection],
		[dom.navLive, 'live', dom.streamSection], [dom.navSetup, 'setup', dom.studioSettings],
		[dom.navNle, 'nle', dom.nleSection], [dom.navBenchmark, 'nle', dom.benchmarkCard],
		[dom.backToStudio, 'home', dom.homeSection]
	];

	actions.forEach(([button, page, focus]) => bindButton(button, () => openPage(page, focus, `${pageLabel(page)} ready.`)));
}

function bindButton(button, action) {
	button?.addEventListener('click', (event) => {
		event.preventDefault();
		action();
	});
}

function bindPageTargets(openPage) {
	document.querySelectorAll('[data-page-target]').forEach((element) => {
		element.addEventListener('click', (event) => {
			event.preventDefault();
			const page = element.dataset.pageTarget;
			openPage(page, pageElement(page), `${pageLabel(page)} ready.`);
		});
	});
}

function bindKeyboardNavigation(controller, openPage) {
	window.addEventListener('keydown', (event) => {
		if (!event.altKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
		const current = controller.currentPage?.dataset.studioPage || 'home';
		const index = PAGE_ORDER.indexOf(current);
		const targetIndex = event.key === 'ArrowRight' ? index + 1 : index - 1;
		const page = PAGE_ORDER[Math.max(0, Math.min(PAGE_ORDER.length - 1, targetIndex))];
		if (page !== current) openPage(page, pageElement(page), `${pageLabel(page)} ready.`);
	});
}

function openInitialLocation(openPage) {
	const hashId = (location.hash || '').slice(1);
	const hashElement = hashId ? document.getElementById(hashId) : null;
	const page = hashElement?.closest?.('[data-studio-page]')?.dataset.studioPage || hashElement?.dataset?.studioPage || 'home';
	openPage(page, hashElement || pageElement(page), `${pageLabel(page)} ready.`, false);
}

function markNavigation(page, focusId) {
	document.querySelectorAll('[data-nav-page]').forEach((button) => {
		const benchmark = focusId === 'benchmarkCard';
		const active = benchmark ? button.id === 'navBenchmark' : button.dataset.navPage === page && button.id !== 'navBenchmark';
		button.classList.toggle('active', active);
	});
}

function pageElement(page) {
	return document.querySelector(`[data-studio-page="${page}"]`);
}

function pageLabel(page) {
	return { home: 'Studio home', stage: 'Stage', audio: 'Audio Lab', sources: 'Sources', live: 'Live health', setup: 'Studio setup', nle: 'Timeline editor' }[page] || 'Studio';
}
