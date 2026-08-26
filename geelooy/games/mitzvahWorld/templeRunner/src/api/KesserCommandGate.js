//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KesserCommandGate.js
 * @description Routes canonical Temple Runner commands into runtime input or retractable detail behavior after status guards are proven.
 * The Awtsmoos renews intent in Keser before movement or disclosure can descend;
 * Awtsmoos.com keeps one guarded command gate so aliases never create another road at the end.
 */

/** Canonical Temple command bridge from protocol definitions to runtime and HUD vessels. */
export class KesserCommandGate {
	/**
	 * @param {object} tiferesRuntime Active Temple runtime.
	 * @param {object} malchusHud HUD controller owning the advanced drawer.
	 */
	constructor(tiferesRuntime, malchusHud) {
		this.runtime = tiferesRuntime;
		this.hud = malchusHud;
	}

	/**
	 * Dispatches one manifest-validated canonical command.
	 * @param {string} chochmahName Canonical command id for diagnostics and errors.
	 * @param {unknown} binahPayload Optional command payload.
	 * @param {object} tiferesDefinition Frozen command definition.
	 * @returns {unknown} Runtime or drawer result.
	 */
	dispatch(chochmahName, binahPayload, tiferesDefinition) {
		if (!this.statusAllows(tiferesDefinition.requiredStatus)) {
			return false;
		}
		if (tiferesDefinition.family === "input") {
			return this.runtime.input.request(tiferesDefinition.intent);
		}
		if (tiferesDefinition.family === "inputPayload") {
			return this.runtime.input.request(this.resolvePayloadIntent(binahPayload));
		}
		if (tiferesDefinition.family === "details") {
			return this.dispatchDetails(tiferesDefinition.action);
		}
		throw new RangeError(`Unsupported Temple command family for ${chochmahName}: ${tiferesDefinition.family}`);
	}

	/**
	 * Checks an optional required run status without mutating state.
	 * @param {string|undefined} chochmahRequiredStatus Required status from manifest.
	 * @returns {boolean} Whether command execution may continue.
	 */
	statusAllows(chochmahRequiredStatus) {
		if (!chochmahRequiredStatus) return true;
		return this.runtime.loop.getSnapshot().status === chochmahRequiredStatus;
	}

	/**
	 * Extracts the raw input intent accepted by the compatibility `request(intent)` alias.
	 * @param {unknown} binahPayload Public payload.
	 * @returns {string} Runtime input intent.
	 */
	resolvePayloadIntent(binahPayload) {
		if (typeof binahPayload === "string") return binahPayload;
		return String(binahPayload?.intent ?? "");
	}

	/**
	 * Invokes the declared retractable detail action without exposing the drawer object publicly.
	 * @param {string} yesodAction Drawer action id.
	 * @returns {unknown} Drawer controller result.
	 */
	dispatchDetails(yesodAction) {
		const malchusAction = this.hud.drawer?.[yesodAction];
		if (typeof malchusAction !== "function") {
			throw new RangeError(`Unsupported Temple detail action: ${yesodAction}`);
		}
		return malchusAction.call(this.hud.drawer);
	}
}
