//B"H
// Boruch Hashem
// Blessed is He

import { actionButton, createElement } from "./dom.js";

/**
 * @file Canonical alias/site publication controls over server-proven mapping state.
 * @description The Awtsmoos lets a creator request an owned alias and site ID while Awtsmoos.com withholds every published badge and path until the server itself returns the durable mapping.
 */

export function createCanonicalPublishView(actions) {
	const aliasInput = identityInput("Awtsmoos alias ID", "alias-id");
	const siteInput = identityInput("Site ID", "site-id");
	const sourceRoot = createElement("code", { className: "canonical-source-root" });
	const status = createElement("div", { className: "canonical-status" });
	const refresh = actionButton("Refresh", actions.refreshCanonicalSites, { className: "button quiet" });
	const publish = actionButton("Publish canonical", actions.publishCanonicalSite, { className: "button primary" });
	const detach = actionButton("Detach", actions.detachCanonicalSite, { className: "button quiet" });
	const commitTarget = () => actions.setCanonicalTarget({ aliasId: aliasInput.value, siteId: siteInput.value });
	aliasInput.addEventListener("change", commitTarget);
	siteInput.addEventListener("change", commitTarget);
	const element = createElement("section", {
		className: "canonical-publish-card",
		children: [
			createElement("div", { className: "canonical-publish-heading", children: [
				createElement("span", { className: "eyebrow", text: "Stage 3 · Durable identity" }),
				createElement("h3", { text: "Canonical Awtsmoos site" }),
				createElement("p", { text: "Choose the owned alias and strict site ID. Typing them does not publish anything; server ownership proof does." })
			] }),
			createElement("div", { className: "canonical-target-grid", children: [field("Alias ID", aliasInput), field("Site ID", siteInput)] }),
			createElement("div", { className: "canonical-root-row", children: [createElement("strong", { text: "Source root" }), sourceRoot] }),
			status,
			createElement("div", { className: "canonical-actions", children: [refresh, publish, detach] })
		]
	});
	return {
		element,
		render(plan) {
			const canonical = plan.canonicalPublication;
			setWhenUnfocused(aliasInput, canonical.aliasId);
			setWhenUnfocused(siteInput, canonical.siteId);
			sourceRoot.textContent = canonical.sourceRoot;
			refresh.disabled = !canonical.aliasId;
			publish.disabled = !canonical.targetConfigured;
			detach.disabled = !canonical.linked;
			status.replaceChildren(statusView(canonical));
		}
	};
}

function identityInput(label, name) {
	return createElement("input", {
		className: "canonical-identity-input",
		attributes: { type: "text", name, autocomplete: "off", "aria-label": label }
	});
}

function field(label, input) {
	return createElement("label", {
		className: "canonical-field",
		children: [createElement("span", { text: label }), input]
	});
}

function statusView(canonical) {
	const children = [
		createElement("strong", { text: canonical.linked ? "Server-confirmed canonical site" : canonical.status }),
		createElement("span", { text: canonical.linked ? "This mapping was returned by the owner-authorized server." : "Target configuration alone is not publication." })
	];
	if (canonical.canonicalPath) {
		children.push(createElement("a", {
			text: canonical.canonicalPath,
			attributes: { href: canonical.canonicalPath, target: "_blank", rel: "noopener" }
		}));
	}
	return createElement("div", { className: canonical.linked ? "canonical-proof ready" : "canonical-proof pending", children });
}

function setWhenUnfocused(input, value) {
	if (document.activeElement !== input) input.value = String(value || "");
}
