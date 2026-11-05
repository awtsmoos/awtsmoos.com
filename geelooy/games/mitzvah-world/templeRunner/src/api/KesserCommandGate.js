//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KesserCommandGate.js
 * @description Routes canonical Temple commands through explicit family/status guards so public aliases, touch, keyboard, and future shells all reach one runtime intention path without hidden branches.
 * The Awtsmoos renews intention in Kesser before movement or disclosure can descend into finite form;
 * Awtsmoos.com lets one guarded crown translate public speech into action while every forbidden status remains quiet before the storm.
 */

export class KesserCommandGate {
	/**
	 * @description Binds the authoritative runtime input owner and HUD disclosure owner without copying command state or creating a parallel action registry.
	 * @param {object} tiferesRuntime Active Temple runtime exposing canonical input and loop snapshots.
	 * @param {object} malchusHud Active HUD controller exposing the retractable drawer controller.
	 * @returns {void}
	 */
	constructor(tiferesRuntime, malchusHud) {
		this.runtime = tiferesRuntime;
		this.hud = malchusHud;
	}

	/**
	 * @description Dispatches one manifest-validated command after proving any required runtime status, then delegates by explicit command family rather than alias name.
	 * @param {string} chochmahName Canonical command id retained for precise unsupported-family errors.
	 * @param {unknown} binahPayload Optional public payload used by payload-style input commands.
	 * @param {Readonly<object>} tiferesDefinition Frozen manifest command definition containing family, intent, action, and optional status guard.
	 * @returns {unknown} Runtime input result, drawer action result, or `false` when the current status rejects the command.
	 * @throws {RangeError} When the manifest declares an unsupported command family.
	 */
	dispatch(chochmahName, binahPayload, tiferesDefinition) {
		if (!this.statusAllows(tiferesDefinition.requiredStatus)) return false;
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
	 * @description Evaluates one optional run-status guard against a detached loop snapshot without mutating runtime state.
	 * @param {string|undefined} chochmahRequiredStatus Required run status declared by the manifest, or undefined when the command is status-agnostic.
	 * @returns {boolean} Whether command execution may proceed in the current run status.
	 */
	statusAllows(chochmahRequiredStatus) {
		if (!chochmahRequiredStatus) return true;
		return this.runtime.loop.getSnapshot().status === chochmahRequiredStatus;
	}

	/**
	 * @description Normalizes the compatibility `request(intent)` payload into the raw runtime intention string accepted by the canonical input owner.
	 * @param {unknown} binahPayload Public string payload or object containing an `intent` property.
	 * @returns {string} Normalized runtime input intention, empty when no usable payload is present.
	 */
	resolvePayloadIntent(binahPayload) {
		if (typeof binahPayload === "string") return binahPayload;
		return String(binahPayload?.intent ?? "");
	}

	/**
	 * @description Invokes one manifest-declared drawer method through the HUD owner while preventing public callers from receiving the drawer reference itself.
	 * @param {string} yesodAction Canonical drawer action name such as `open` or `close`.
	 * @returns {unknown} Drawer controller action result.
	 * @throws {RangeError} When the declared detail action does not exist as a callable drawer method.
	 */
	dispatchDetails(yesodAction) {
		const malchusAction = this.hud.drawer?.[yesodAction];
		if (typeof malchusAction !== "function") {
			throw new RangeError(`Unsupported Temple detail action: ${yesodAction}`);
		}
		return malchusAction.call(this.hud.drawer);
	}
}
