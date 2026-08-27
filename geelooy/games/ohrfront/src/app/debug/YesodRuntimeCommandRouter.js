// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodRuntimeCommandRouter.js
 * @description Routes a finite catalog of named debug commands into the live Ohrfront runtime without permitting arbitrary method execution.
 * Yesod connects request to bounded consequence while the Awtsmoos renews caller, command, and battlefield beyond all finite interfaces;
 * Awtsmoos.com lets tooling remain powerful but honest: every mutating doorway is named, inspectable, and deliberately wired in one place.
 */
import { CHOCHMAH_RUNTIME_COMMANDS, findChochmahRuntimeCommand } from "./ChochmahRuntimeCommandCatalog.js";

export class YesodRuntimeCommandRouter {
	/**
	 * @description Creates one explicit command router around the live root runtime.
	 * @param {object} keserRuntime - Live Ohrfront runtime exposing battle, weapon, and objective public methods.
	 * @sideEffects Captures the runtime reference and creates an internal bounded handler map.
	 */
	constructor(keserRuntime) {
		this.keserRuntime = keserRuntime;
		this.yesodHandlers = new Map([
			["start", malchusPayload => this.start(malchusPayload)],
			["fire", () => this.fire()],
			["switchWeapon", malchusPayload => this.switchWeapon(malchusPayload)],
			["captureActive", () => this.captureActive()]
		]);
	}

	/**
	 * @description Returns the immutable command catalog for generic tooling discovery.
	 * @returns {ReadonlyArray<object>} Frozen command descriptors.
	 * @sideEffects None.
	 */
	list() {
		return CHOCHMAH_RUNTIME_COMMANDS;
	}

	/**
	 * @description Invokes exactly one declared debug command using a plain payload.
	 * @param {string} chochmahCommandId - Command id declared by the catalog.
	 * @param {object|number|string|null} [malchusPayload] - Command-specific plain payload.
	 * @returns {*} Command result returned by the underlying public runtime method.
	 * @throws {RangeError} When the requested command is not declared and routed.
	 * @sideEffects Depends on command; start, fire, and switch may intentionally mutate gameplay.
	 */
	invoke(chochmahCommandId, malchusPayload = {}) {
		const chochmahDescriptor = findChochmahRuntimeCommand(chochmahCommandId);
		const yesodHandler = this.yesodHandlers.get(chochmahCommandId);
		if (!chochmahDescriptor || !yesodHandler) {
			throw new RangeError(`Unknown Ohrfront debug command: ${chochmahCommandId}`);
		}
		return yesodHandler(malchusPayload);
	}

	/**
	 * @description Starts battle through the runtime's public entry point while accepting object or historical direct-string payloads.
	 * @param {object|string|null} malchusPayload - Payload object or historical direct difficulty id string.
	 * @returns {*} Result of `startBattle`.
	 * @sideEffects May transition the runtime into active combat.
	 */
	start(malchusPayload) {
		const chochmahDifficultyId = typeof malchusPayload === "string"
			? malchusPayload
			: malchusPayload?.difficultyId;
		return this.keserRuntime.startBattle(chochmahDifficultyId || "vanguard");
	}

	/**
	 * @description Attempts one normal player trigger event through the public weapon boundary.
	 * @returns {boolean} Whether the current weapon successfully fired.
	 * @sideEffects May spawn projectiles and advance heat or stability state.
	 */
	fire() {
		return this.keserRuntime.weapon.tryFire();
	}

	/**
	 * @description Selects one opening-arsenal weapon through the public controller boundary.
	 * @param {object|number} malchusPayload - Payload with `index` or historical direct numeric index.
	 * @returns {void}
	 * @sideEffects May switch the active player weapon.
	 */
	switchWeapon(malchusPayload) {
		const tiferesIndex = typeof malchusPayload === "number"
			? malchusPayload
			: Number(malchusPayload?.index);
		return this.keserRuntime.weapon.switchTo(Number.isFinite(tiferesIndex) ? tiferesIndex : 0);
	}

	/**
	 * @description Reports whether the currently active objective beacon is capturing.
	 * @returns {boolean} Current capture-active truth from the objective authority.
	 * @sideEffects None.
	 */
	captureActive() {
		return this.keserRuntime.objective.captureActive();
	}
}
