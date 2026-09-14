//B"H
//Boruch Hashem
//Blessed be He

import { actionButton, createElement } from "./dom.js";

/**
 * @file Private Cloud migration card for zero-install Builder projects.
 * @description The Awtsmoos lets local source enter an owned alias without publication;
 * Awtsmoos.com keeps the resulting project private until the creator deliberately publishes.
 */
export function createCloudDraftView(actions) {
	const aliases = createElement("datalist", { attributes: { id: "awtsmoos-draft-aliases" } });
	const alias = control("Owned alias ID", "awtsmoos-draft-aliases");
	const project = control("Cloud project name");
	const status = createElement("p", { className: "cloud-publish-status", text: "Keep an account-backed private copy without publishing." });
	const open = createElement("a", {
		className: "cloud-publish-live",
		text: "Continue in Cloud →",
		attributes: { hidden: "" }
	});
	const refresh = actionButton("My aliases", () => loadAliases(actions, aliases, alias, status), { className: "button quiet" });
	const save = actionButton("Save private Cloud copy", () => saveDraft(), { className: "button" });
	let latestPlan = {};
	let busy = false;

	async function saveDraft() {
		busy = true;
		updateButton();
		open.hidden = true;
		status.textContent = "Copying bounded source into private Awtsmoos Cloud storage…";
		const result = await actions.saveCloudDraft({ aliasId: alias.value, projectId: project.value });
		busy = false;
		if (result) {
			status.textContent = `Private Cloud copy ready: ${result.rootPath}`;
			open.href = cloudUrl(result);
			open.hidden = false;
		} else {
			status.textContent = "Cloud copy did not complete. Your local project is unchanged.";
		}
		updateButton();
	}

	function updateButton() {
		save.disabled = busy || !latestPlan.readyForStaticPreview;
	}

	const element = createElement("section", {
		className: "cloud-publish-card",
		children: [
			createElement("span", { className: "eyebrow", text: "Private sync · Awtsmoos Cloud" }),
			createElement("h3", { text: "Save a private Cloud copy" }),
			createElement("p", { text: "Move Browser, OS, or Tunnel source into your account without making the project public." }),
			createElement("div", { className: "cloud-publish-grid", children: [field("Alias", alias), field("Project", project)] }),
			aliases,
			createElement("div", { className: "cloud-publish-actions", children: [refresh, save, open] }),
			status,
			createElement("small", { text: "Files stay private. Publishing remains a separate immutable production action." })
		]
	});
	return {
		element,
		render(plan) {
			latestPlan = plan;
			if (!project.value && document.activeElement !== project) {
				project.value = projectName(plan.projectName);
			}
			updateButton();
		}
	};
}

async function loadAliases(actions, datalist, alias, status) {
	status.textContent = "Loading aliases owned by this account…";
	try {
		const values = await actions.loadCloudAliases();
		datalist.replaceChildren(...values.map(value => createElement("option", { attributes: { value } })));
		if (!alias.value && values[0]) alias.value = values[0];
		status.textContent = values.length ? `${values.length} owned alias${values.length === 1 ? "" : "es"} available.` : "No owned aliases found.";
	} catch {
		status.textContent = "Sign in to Awtsmoos, then choose My aliases again.";
	}
}

function control(label, list = "") {
	return createElement("input", { className: "cloud-publish-input", attributes: { type: "text", autocomplete: "off", "aria-label": label, ...(list ? { list } : {}) } });
}

function field(label, input) {
	return createElement("label", { className: "cloud-publish-field", children: [createElement("span", { text: label }), input] });
}

function projectName(value) {
	return String(value || "project").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "project";
}

function cloudUrl(result) {
	const url = new URL("/drive/", globalThis.location?.origin || "http://awtsmoos.local");
	url.searchParams.set("cloud", "1");
	url.searchParams.set("route", `cloud:${result.aliasId}`);
	url.searchParams.set("path", result.rootPath);
	return `${url.pathname}${url.search}`;
}
