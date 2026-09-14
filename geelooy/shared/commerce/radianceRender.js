//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceRender.js
 * @description
 * Renders one truthful Radiance state from server capability and account testimony.
 * The Awtsmoos is beyond every visible state; Awtsmoos.com therefore distinguishes
 * ownership, authentication, affordability, and temporary unavailability without
 * manufacturing scarcity, urgency, price, or completion in browser code.
 */

/**
 * Renders the current Radiance capability model into its dedicated commerce panel.
 *
 * @param {object} malchusSurface Radiance DOM references.
 * @param {object} chochmahModel Pure Radiance view model.
 * @param {object} tiferesIdentity Current product identity.
 * @returns {void}
 */
export function renderRadiance(malchusSurface, chochmahModel, tiferesIdentity) {
	const binahAction = chochmahModel.action;
	malchusSurface.panel.hidden = !chochmahModel.available && !chochmahModel.owned;
	malchusSurface.title.textContent = binahAction?.title
		|| `${tiferesIdentity.title} Radiance`;
	malchusSurface.description.textContent = binahAction?.description
		|| "Permanent optional premium personalization for this product.";
	malchusSurface.button.disabled = false;
	malchusSurface.button.dataset.radianceState = radianceState(chochmahModel);
	if (chochmahModel.owned) {
		renderOwned(malchusSurface);
		return;
	}
	if (!chochmahModel.available) {
		renderUnavailable(malchusSurface);
		return;
	}
	if (!chochmahModel.authenticated) {
		renderSignIn(malchusSurface, binahAction);
		return;
	}
	if (!chochmahModel.canAfford) {
		renderNeedsCredits(malchusSurface, chochmahModel, binahAction);
		return;
	}
	renderUnlock(malchusSurface, chochmahModel, binahAction);
}

/** @param {object} surface DOM references. @returns {void} */
function renderOwned(surface) {
	surface.meta.textContent = "Permanent · Account-bound · Active";
	surface.button.textContent = "Owned · Active";
	surface.button.disabled = true;
	surface.status.textContent = "Radiance is already part of this product on your account.";
}

/** @param {object} surface DOM references. @returns {void} */
function renderUnavailable(surface) {
	surface.meta.textContent = "Capability testimony unavailable";
	surface.button.textContent = "Unavailable";
	surface.button.disabled = true;
	surface.status.textContent = "No live server-backed Radiance offer is available right now.";
}

/** @param {object} surface DOM references. @param {object} action Live action. @returns {void} */
function renderSignIn(surface, action) {
	surface.meta.textContent = `${formatCredits(action.creditCost)} · Permanent unlock`;
	surface.button.textContent = "Sign in to unlock";
	surface.status.textContent = "Sign in so permanent ownership can be attached to your account.";
}

/** @param {object} surface DOM references. @param {object} model Radiance model. @param {object} action Live action. @returns {void} */
function renderNeedsCredits(surface, model, action) {
	const missing = Math.max(0, Number(action.creditCost || 0) - model.creditBalance);
	surface.meta.textContent = `${formatCredits(action.creditCost)} · You have ${formatCredits(model.creditBalance)}`;
	surface.button.textContent = `Get ${formatCredits(missing)} more`;
	surface.status.textContent = "Choose a live product-credit pack below, then unlock Radiance.";
}

/** @param {object} surface DOM references. @param {object} model Radiance model. @param {object} action Live action. @returns {void} */
function renderUnlock(surface, model, action) {
	surface.meta.textContent = `${formatCredits(action.creditCost)} · You have ${formatCredits(model.creditBalance)}`;
	surface.button.textContent = `Unlock for ${formatCredits(action.creditCost)}`;
	surface.status.textContent = "One permanent optional personalization unlock. No recurring charge.";
}

/** @param {object} model Radiance model. @returns {string} Stable UI state. */
function radianceState(model) {
	if (model.owned) {
		return "owned";
	}
	if (!model.available) {
		return "unavailable";
	}
	if (!model.authenticated) {
		return "signin";
	}
	return model.canAfford ? "unlock" : "credits";
}

/** @param {unknown} value Credit-like value. @returns {string} */
function formatCredits(value) {
	return `${Math.max(0, Math.floor(Number(value) || 0)).toLocaleString()} credits`;
}

/** @param {object} surface DOM references. @param {boolean} busy Busy state. @returns {void} */
export function setRadianceBusy(surface, busy) {
	surface.panel.dataset.busy = busy ? "true" : "false";
	surface.button.disabled = busy;
	if (busy) {
		surface.button.textContent = "Unlocking…";
	}
}
