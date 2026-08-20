//B"H
// Boruch Hashem
// Blessed is He

import { buildPublishPlan } from "../builder/publishPlan.js";
import { actionButton, createElement } from "./dom.js";
import { createCanonicalPublishView } from "./canonicalPublishView.js";
import { renderPublishStages } from "./publishStagesView.js";

/**
 * @file Four-stage publication surface for Geelooy Sites.
 * @description The Awtsmoos unfolds source preview, temporary owned preview, durable canonical identity, and custom domain as distinct gates while Awtsmoos.com exposes only authority already proven.
 */

export function createPublishPanelView(actions) {
	const readiness = createElement("div", { className: "site-publish-readiness" });
	const stages = createElement("div", { className: "site-publish-stage-host" });
	const previews = createElement("div", { className: "site-published-list" });
	const canonical = createCanonicalPublishView(actions);
	const publishButton = actionButton("Publish owned preview", actions.publish, { className: "button primary" });
	const domainButton = actionButton("Open Domain", actions.builderDomain, { className: "button" });
	const domainStatus = createElement("p", { className: "publish-domain-status" });
	const element = createElement("section", {
		className: "site-publish-panel panel",
		children: [
			heading(),
			stages,
			readiness,
			previewControls(publishButton),
			previewListHeading(),
			previews,
			canonical.element,
			domainCard(domainButton, domainStatus)
		]
	});
	return {
		element,
		render(state) {
			const plan = buildPublishPlan(state);
			publishButton.disabled = !plan.previewPublication.available;
			publishButton.title = plan.previewPublication.available
				? "Choose private/public visibility and a bounded TTL"
				: "Requires a Tunnel-backed project";
			stages.replaceChildren(renderPublishStages(plan.stages));
			readiness.replaceChildren(readinessCard(plan));
			previews.replaceChildren(...previewCards(state.previews, actions));
			canonical.render(plan);
			domainStatus.textContent = plan.customDomain.description;
		}
	};
}

function heading() {
	return createElement("div", { className: "panel-heading stacked", children: [
		createElement("span", { className: "eyebrow", text: "Source → Preview → Canonical → Domain" }),
		createElement("h2", { text: "Publish" }),
		createElement("p", { text: "Each stage proves a different fact. A temporary preview is not a canonical site, and a canonical site is not yet a verified custom domain." })
	] });
}

function previewControls(button) {
	return createElement("div", { className: "site-publish-actions", children: [button] });
}

function previewListHeading() {
	return createElement("h3", { className: "site-published-title", text: "Stage 2 · Owned folder previews" });
}

function domainCard(button, status) {
	return createElement("section", { className: "publish-domain-card", children: [
		createElement("span", { className: "eyebrow", text: "Stage 4 · Hostname" }),
		createElement("h3", { text: "Custom domain + HTTPS" }),
		status,
		button
	] });
}

function readinessCard(plan) {
	return createElement("div", { className: `site-readiness-card ${plan.readyForStaticPreview ? "ready" : "warning"}`, children: [
		createElement("strong", { text: plan.readyForStaticPreview ? `${plan.entryPoint} ready` : "No index.html detected" }),
		createElement("span", { text: `Stage 1 source root: ${plan.rootPath}` })
	] });
}

function previewCards(value, actions) {
	const list = Array.isArray(value) ? value : [];
	if (!list.length) return [createElement("p", { className: "published-empty", text: "No owned folder previews yet." })];
	return list.map(preview => previewCard(preview, actions));
}

function previewCard(preview, actions) {
	const url = String(preview.publicUrl || preview.url || preview.viewUrl || "");
	const id = String(preview.previewId || preview.id || "");
	return createElement("article", { className: "site-preview-card", children: [
		createElement("strong", { text: preview.title || "Website preview" }),
		createElement("span", { text: preview.visibility || "owned preview" }),
		createElement("div", { className: "site-preview-actions", children: [
			url ? createElement("a", { text: "Open", attributes: { href: url, target: "_blank", rel: "noopener" } }) : null,
			id ? actionButton("Revoke", () => actions.revokePreview(id), { className: "button small quiet" }) : null
		].filter(Boolean) })
	] });
}
