//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creator-facing canonical Site runtime attachment vessel.
 * @description
 * The Awtsmoos lets one public garden receive a living project without exposing the hidden owner root;
 * Awtsmoos.com shows only canonical identity, project identity, attachment truth, and safe actions so the creator sees one road from source to public light.
 */
export function createProjectSiteRuntimeView(actions) {
	const element = node("section", "hosting-card site-runtime-card");
	const status = node("span", "hosting-card__status", "Choose a canonical Site");
	const body = node("div", "hosting-card__body");
	const attach = button("Attach this project", () => actions.attach());
	const detach = button("Detach runtime", () => actions.detach());
	status.setAttribute("role", "status");
	status.setAttribute("aria-live", "polite");
	element.append(header(status), body, controls(attach, detach));
	return {
		element,
		render(state) {
			status.textContent = statusText(state);
			body.replaceChildren(...bodyNodes(state));
			attach.disabled = state.busy || !state.ready || state.attached;
			detach.disabled = state.busy || !state.ready || !state.attached;
		}
	};
}

function header(status) {
	const element = node("div", "hosting-card__head");
	const copy = node("div");
	copy.append(
		node("p", "hosting-card__eyebrow", "Canonical public runtime"),
		node("h3", "hosting-card__title", "Attach runtime to Site")
	);
	element.append(copy, status);
	return element;
}

function controls(attach, detach) {
	const element = node("div", "hosting-card__controls");
	element.append(attach, detach);
	return element;
}

function bodyNodes(state) {
	if (!state.ready) {
		return [node("p", "hosting-card__message", "Choose an owned alias and Site ID in Publish first. Hosting reuses that same canonical identity.")];
	}
	const facts = node("div", "hosting-card__grid");
	facts.append(
		fact("Site", `${state.aliasId}/${state.siteId}`),
		fact("Project", state.projectId),
		fact("Public URL", `/sites/${encodeURIComponent(state.aliasId)}/${encodeURIComponent(state.siteId)}/`),
		fact("Binding", state.attached ? `Hosted project · ${state.attachedProjectId || state.projectId}` : "Static/direct source")
	);
	const nodes = [facts];
	if (state.error) nodes.push(node("p", "hosting-card__error", state.error));
	return nodes;
}

function fact(label, value) {
	const element = node("div", "hosting-card__fact");
	element.append(node("span", "", label), node("strong", "", value));
	return element;
}

function statusText(state) {
	if (state.busy) return "Updating Site…";
	if (!state.ready) return "Canonical target required";
	return state.attached ? "Runtime attached" : "Ready to attach";
}

function button(label, action) {
	const element = node("button", "hosting-card__refresh", label);
	element.type = "button";
	element.addEventListener("click", () => void action());
	return element;
}

function node(tagName, className = "", text = "") {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = text;
	return element;
}
