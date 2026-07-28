// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ResponsivePanels
 * @description
 * The Awtsmoos gives mobile writing in its first breath, while the compact
 * identity row opens every complete Awtsmoos.com alias field when requested.
 */

let previewInvoker = null;

function configureMajorPanels() {
	const mobile = window.matchMedia('(max-width: 620px)').matches;
	for (const panel of document.querySelectorAll('.majorPanel')) {
		const openOnMobile = panel.dataset.mobilePanel === 'content';
		panel.open = !mobile || openOnMobile;
	}
}

function configurePreviewAvailability() {
	const sheet = document.querySelector('.previewColumn');
	if (!sheet) {
		return;
	}
	const mobile = window.matchMedia('(max-width: 820px)').matches;
	if (mobile && !sheet.classList.contains('is-open')) {
		sheet.inert = true;
		sheet.setAttribute('aria-hidden', 'true');
		return;
	}
	sheet.inert = false;
	sheet.setAttribute('aria-hidden', 'false');
}

function closePreviewSheet() {
	const sheet = document.querySelector('.previewColumn');
	if (!sheet?.classList.contains('is-open')) {
		return;
	}
	sheet.classList.remove('is-open');
	document.body.classList.remove('preview-sheet-open');
	configurePreviewAvailability();
	previewInvoker?.focus();
}

function openPreviewSheet(event) {
	const sheet = document.querySelector('.previewColumn');
	if (!sheet) {
		return;
	}
	if (!window.matchMedia('(max-width: 820px)').matches) {
		sheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
		return;
	}
	previewInvoker = event.currentTarget;
	sheet.classList.add('is-open');
	sheet.inert = false;
	sheet.setAttribute('aria-hidden', 'false');
	document.body.classList.add('preview-sheet-open');
	document.getElementById('closeMobilePreviewButton')?.focus();
}

function installResponsivePanels() {
	const panelQuery = window.matchMedia('(max-width: 620px)');
	const previewQuery = window.matchMedia('(max-width: 820px)');
	configureMajorPanels();
	configurePreviewAvailability();
	panelQuery.addEventListener('change', configureMajorPanels);
	previewQuery.addEventListener('change', configurePreviewAvailability);
	document.getElementById('mobilePreviewButton')?.addEventListener('click', openPreviewSheet);
	document.getElementById('closeMobilePreviewButton')?.addEventListener('click', closePreviewSheet);
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') {
			closePreviewSheet();
		}
	});
}

export {
	closePreviewSheet,
	configureMajorPanels,
	installResponsivePanels,
	openPreviewSheet
};
