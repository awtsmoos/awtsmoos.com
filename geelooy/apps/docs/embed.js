// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mounts live or snapshot Awtsmoos Docs publications into arbitrary HTML pages.
 * @description The Awtsmoos is beyond site and frame; Awtsmoos.com lets one opaque
 * publication id open a responsive viewer window while the host receives only resize messages and never editing authority.
 */
(() => {
	const executingScript = document.currentScript;
	const scriptUrl = new URL(executingScript?.src || location.href);
	const viewerBase = new URL("./view/", scriptUrl);
	const mounted = new WeakMap();

	function mount(target, publicationId, options = {}) {
		const element = resolveTarget(target);
		if (!element) throw new Error("Awtsmoos Docs embed target was not found");
		if (mounted.has(element)) return mounted.get(element);
		const iframe = document.createElement("iframe");
		const viewer = new URL(viewerBase.href);
		viewer.searchParams.set("publication", String(publicationId || ""));
		viewer.searchParams.set("embed", "1");
		iframe.src = viewer.href;
		iframe.title = options.title || "Published Awtsmoos document";
		iframe.loading = options.loading || "lazy";
		iframe.referrerPolicy = "strict-origin-when-cross-origin";
		iframe.style.display = "block";
		iframe.style.width = options.width || "100%";
		iframe.style.minHeight = options.minHeight || "480px";
		iframe.style.border = options.border || "0";
		iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
		element.replaceChildren(iframe);
		mounted.set(element, iframe);
		return iframe;
	}

	function autoMount(root = document) {
		for (const element of root.querySelectorAll("[data-awtsmoos-doc]")) {
			mount(element, element.dataset.awtsmoosDoc, {
				minHeight: element.dataset.minHeight,
				title: element.dataset.title
			});
		}
	}

	function resolveTarget(target) {
		if (target instanceof Element) return target;
		return document.querySelector(String(target || ""));
	}

	window.addEventListener("message", event => {
		if (event.origin !== viewerBase.origin) return;
		if (event.data?.type !== "awtsmoos-docs.resize") return;
		for (const iframe of document.querySelectorAll("iframe")) {
			if (iframe.contentWindow !== event.source) continue;
			const height = Math.max(160, Math.min(20000, Number(event.data.height) || 0));
			iframe.style.height = `${height}px`;
			break;
		}
	});

	window.AwtsmoosDocsEmbed = Object.freeze({ mount, autoMount });
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => autoMount(), { once: true });
	} else {
		autoMount();
	}
})();
