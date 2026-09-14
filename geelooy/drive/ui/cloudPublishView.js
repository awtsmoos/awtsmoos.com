//B"H
//Boruch Hashem
//Blessed be He

import { actionButton, createElement } from "./dom.js";
import { createCloudPublishGrowth } from "./cloudPublishGrowth.js";

/**
 * @file One-step Awtsmoos Cloud publication card for every Builder workspace.
 * @description The Awtsmoos lets a creator choose owned identity and publish one immutable revision while Awtsmoos.com keeps alias discovery optional, source bounded, and live testimony server-proven.
 */
export function createCloudPublishView(actions) {
	const aliases = createElement("datalist", { attributes: { id: "awtsmoos-cloud-aliases" } });
	const alias = input("Owned alias ID", "awtsmoos-cloud-aliases");
	const site = input("Site ID");
	const title = input("Site title");
	const status = createElement("p", { className: "cloud-publish-status", text: "Ready when your source is ready." });
	const growth = createCloudPublishGrowth({ notify: message => { status.textContent = message; } });
	const refreshAliases = actionButton("My aliases", () => loadAliases(actions, aliases, alias, status), { className: "button quiet" });
	const publish = actionButton("Publish immutable Site", () => publishSite(), { className: "button primary" });
	let latestState = {};
	let latestPlan = {};
	let busy = false;

	async function publishSite() {
		busy = true;
		updateButton();
		status.textContent = "Publishing bounded source and creating an immutable revision…";
		growth.clear();
		const result = await actions.publishToCloud({
			aliasId: alias.value,
			siteId: site.value,
			title: title.value || latestPlan.projectName
		});
		busy = false;
		if (result) {
			status.textContent = `Live immutable revision: ${result.publicUrl}`;
			growth.setResult(result);
		} else {
			status.textContent = latestState.error || "Publication did not complete.";
		}
		updateButton();
	}

	function updateButton() {
		publish.disabled = busy || !latestPlan.readyForStaticPreview;
	}

	const element = createElement("section", {
		className: "cloud-publish-card",
		children: [
			createElement("span", { className: "eyebrow", text: "Fast path · Awtsmoos Cloud" }),
			createElement("h3", { text: "Publish without Tunnel" }),
			createElement("p", { text: "Promote Browser, OS, or Tunnel source into owner-scoped Drive, then atomically advance an immutable public revision." }),
			createElement("div", { className: "cloud-publish-grid", children: [field("Alias", alias), field("Site ID", site), field("Title", title)] }),
			aliases,
			createElement("div", { className: "cloud-publish-actions", children: [refreshAliases, publish] }),
			growth.element,
			status,
			createElement("small", { text: "New Sites remain dark until deployment succeeds. Existing immutable Sites stay on their current revision until the replacement is ready." })
		]
	});
	return {
		element,
		render(state, plan) {
			latestState = state;
			latestPlan = plan;
			if (!site.value && document.activeElement !== site) site.value = siteIdFor(plan.projectName);
			if (!title.value && document.activeElement !== title) title.value = plan.projectName || "My Site";
			updateButton();
		}
	};
}

async function loadAliases(actions, datalist, inputElement, status) {
	status.textContent = "Loading aliases owned by this account…";
	try {
		const values = await actions.loadCloudAliases();
		datalist.replaceChildren(...values.map(value => createElement("option", { attributes: { value } })));
		if (!inputElement.value && values[0]) inputElement.value = values[0];
		status.textContent = values.length ? `${values.length} owned alias${values.length === 1 ? "" : "es"} available.` : "No owned aliases found. Sign in or create an alias first.";
	} catch {
		status.textContent = "Sign in to Awtsmoos, then choose My aliases again.";
	}
}

function input(label, list = "") {
	return createElement("input", { className: "cloud-publish-input", attributes: { type: "text", autocomplete: "off", "aria-label": label, ...(list ? { list } : {}) } });
}

function field(label, control) {
	return createElement("label", { className: "cloud-publish-field", children: [createElement("span", { text: label }), control] });
}

function siteIdFor(value) {
	return String(value || "site").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 63) || "site";
}

