//B"H
// Boruch Hashem
// Blessed is He

import { DOMAIN_MODES } from "../builder/domainPlan.js";
import { actionButton, createElement } from "./dom.js";
import { renderDomainClaims } from "./domainClaimView.js";
import { renderDomainPlan } from "./domainPlanView.js";

/**
 * @file Domain planning and server-proven ownership for Geelooy Sites.
 * @description
 * The Awtsmoos lets a hostname move from intention toward public proof without hiding the gates;
 * Awtsmoos.com keeps plan, ownership, delegation, routing, and TLS visibly distinct on one mobile-first surface.
 */

export function createDomainPanelView(actions) {
	const hostname = input("input", {
		type: "text",
		placeholder: "www.example.com",
		"aria-label": "Custom domain"
	});
	const mode = modeSelect();
	const nameservers = input("textarea", {
		rows: "3",
		placeholder: "ns1.provider.com\nns2.provider.com",
		"aria-label": "Custom nameservers"
	}, "domain-nameservers");
	const nameserverField = field("Nameservers", nameservers);
	const planOutput = createElement("div", { className: "domain-plan-output" });
	const claimOutput = createElement("div", { className: "domain-claim-output" });
	mode.addEventListener("change", () => {
		nameserverField.hidden = mode.value !== "custom-nameservers";
	});
	const element = createElement("section", {
		className: "domain-panel panel",
		children: [
			heading(),
			field("Domain or hostname", hostname),
			field("DNS mode", mode),
			nameserverField,
			actionButton("Create domain plan", () => actions.planDomain({
				hostname: hostname.value,
				mode: mode.value,
				nameservers: nameservers.value
			}), { className: "button primary domain-plan-button" }),
			layerHeading("Plan", "Local guidance only. This does not prove ownership."),
			planOutput,
			layerHeading("Claim & verify", "Server-issued proof bound to the selected canonical site."),
			claimOutput,
			createElement("div", {
				className: "domain-infra-note",
				text: "Awtsmoos authoritative nameservers are unavailable: production has Nginx and Certbot, but no authoritative DNS service."
			})
		]
	});
	nameserverField.hidden = true;
	return {
		element,
		render: state => {
			planOutput.replaceChildren(...renderDomainPlan(state.domainPlan));
			claimOutput.replaceChildren(...renderDomainClaims(state, actions));
		}
	};
}

function heading() {
	return createElement("div", { className: "panel-heading stacked", children: [
		createElement("span", { className: "eyebrow", text: "Host anywhere" }),
		createElement("h2", { text: "Domain & nameservers" }),
		createElement("p", {
			text: "Plan locally, prove ownership on the server, then keep DNS, routing, and HTTPS as separate gates."
		})
	] });
}

function layerHeading(title, note) {
	return createElement("div", { className: "domain-layer-heading", children: [
		createElement("h3", { text: title }),
		createElement("p", { text: note })
	] });
}

function modeSelect() {
	const select = input("select", { "aria-label": "DNS mode" });
	for (const item of DOMAIN_MODES) {
		const option = createElement("option", {
			text: item.label,
			attributes: { value: item.id, title: item.reason }
		});
		option.disabled = !item.available;
		select.append(option);
	}
	return select;
}

function input(tag, attributes, extraClass = "") {
	return createElement(tag, {
		className: `domain-input ${extraClass}`.trim(),
		attributes
	});
}

function field(label, control) {
	return createElement("label", {
		className: "domain-field",
		children: [createElement("span", { text: label }), control]
	});
}
