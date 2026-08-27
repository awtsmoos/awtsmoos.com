//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Pure DOM vessels for dynamic hosting readiness.
 * @description
 * The Awtsmoos separates trusted flame, public doorway, and tenant wall in truthful light;
 * Awtsmoos.com must never call one readiness state another merely to make the interface bright.
 */
export function createHostingCardShell(refresh) {
	const element = node("section", "hosting-card");
	const status = node("span", "hosting-card__status", "Waiting for project");
	const body = node("div", "hosting-card__body");
	const exposure = node("select", "hosting-card__select");
	const refreshButton = node("button", "hosting-card__refresh", "Refresh plan");
	status.setAttribute("role", "status");
	status.setAttribute("aria-live", "polite");
	exposure.append(
		new Option("Private project", "private"),
		new Option("Public target", "public")
	);
	refreshButton.type = "button";
	exposure.addEventListener("change", () => void refresh());
	refreshButton.addEventListener("click", () => void refresh());
	element.append(header(status), controls(exposure, refreshButton), body);
	return { element, status, body, exposure };
}

export function renderHostingLoading(status, body) {
	status.textContent = "Checking Ayzarim…";
	body.replaceChildren(node("p", "hosting-card__message", "Reading the bounded hosting contract."));
}

export function renderHostingPlan(status, body, plan) {
	const trustedReady = plan?.lifecycle?.readiness === "trusted-runtime-ready";
	status.textContent = trustedReady ? "Trusted runtime ready" : "Declarative plan live";
	body.replaceChildren(planGrid(plan), readinessBoundary(plan));
}

export function renderHostingError(status, body, error) {
	status.textContent = "Plan unavailable";
	body.replaceChildren(
		node("p", "hosting-card__error", error?.message || "Could not load hosting readiness.")
	);
}

function header(status) {
	const element = node("div", "hosting-card__head");
	const copy = node("div");
	copy.append(
		node("p", "hosting-card__eyebrow", "Ayzarim runtime contract"),
		node("h3", "hosting-card__title", "Dynamic Project Hosting")
	);
	element.append(copy, status);
	return element;
}

function controls(select, button) {
	const element = node("div", "hosting-card__controls");
	const label = node("label", "hosting-card__label", "Exposure");
	label.append(select);
	element.append(label, button);
	return element;
}

function planGrid(plan) {
	const grid = node("div", "hosting-card__grid");
	const facts = [
		["Project", plan?.projectId],
		["Route", plan?.runtime?.routeFile],
		["Database", plan?.database?.root],
		["DB state", plan?.database?.readiness],
		["Publish", plan?.publication?.readiness],
		["Lifecycle", plan?.lifecycle?.readiness]
	];
	for (const [label, value] of facts) {
		const fact = node("div", "hosting-card__fact");
		fact.append(
			node("span", "", label),
			node("strong", "", String(value || "—"))
		);
		grid.append(fact);
	}
	return grid;
}

function readinessBoundary(plan) {
	const trustedReady = plan?.lifecycle?.readiness === "trusted-runtime-ready";
	const publicReady = plan?.publication?.readiness === "ready";
	const className = trustedReady ? "hosting-card__message" : "hosting-card__boundary";
	const messages = node("div", className);
	messages.append(
		node(
			"p",
			"",
			trustedReady
				? "The trusted lifecycle engine is implemented; Drive still needs a server-trusted materialized root before controls can start it."
				: "The trusted runtime lifecycle is not ready yet."
		),
		node(
			"p",
			"",
			publicReady
				? "Public activation is ready."
				: "Public routing still needs its activation adapter."
		),
		node(
			"p",
			"",
			"Tenant isolation is not installed: hosted route files execute with full Node authority and are trusted-code only."
		)
	);
	return messages;
}

function node(tagName, className = "", text = "") {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = text;
	return element;
}
