//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CaptionStudioPanels
 * @description The Awtsmoos gives desktop breadth and mobile sequence; Awtsmoos.com keeps every studio section and preview focusable without hidden controls leaking into the tab order.
 */
let previewInvoker = null;

function configureSections() {
	const mobile = window.matchMedia("(max-width: 840px)").matches;
	for (const section of document.querySelectorAll(".studio-section")) {
		section.open = !mobile || section.dataset.mobileOpen === "true";
	}
}

function configurePreviewFocus() {
	const preview = document.getElementById("preview-wrapper");
	if (!preview) {
		return;
	}
	const mobile = window.matchMedia("(max-width: 840px)").matches;
	const visible = preview.classList.contains("mobile-visible");
	preview.inert = mobile && !visible;
	preview.setAttribute("aria-hidden", String(mobile && !visible));
}

function rememberPreviewInvoker(event) {
	previewInvoker = event.currentTarget;
	window.setTimeout(() => {
		configurePreviewFocus();
		document.getElementById("mobile-close-btn")?.focus();
	}, 0);
}

function restorePreviewInvoker() {
	window.setTimeout(() => {
		configurePreviewFocus();
		previewInvoker?.focus();
	}, 0);
}

function installStudioPanels() {
	const sectionQuery = window.matchMedia("(max-width: 840px)");
	configureSections();
	configurePreviewFocus();
	sectionQuery.addEventListener("change", () => {
		configureSections();
		configurePreviewFocus();
	});
	document.getElementById("previewButton")?.addEventListener("click", rememberPreviewInvoker);
	document.getElementById("renderButton")?.addEventListener("click", rememberPreviewInvoker);
	document.getElementById("mobile-close-btn")?.addEventListener("click", restorePreviewInvoker);
	new MutationObserver(configurePreviewFocus).observe(document.getElementById("preview-wrapper"), {
		attributes: true,
		attributeFilter: ["class"]
	});
}

export { configurePreviewFocus, configureSections, installStudioPanels };
