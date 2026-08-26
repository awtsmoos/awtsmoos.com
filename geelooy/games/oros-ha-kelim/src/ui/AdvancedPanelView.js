//B"H
//Boruch Hashem
//Blessed is He

import { AdvancedPanelBindings } from "./AdvancedPanelBindings.js";
import { collectAdvancedPanelElements } from "./AdvancedPanelElements.js";
import { projectAdvancedDisclosure, projectAdvancedPreferences } from "./AdvancedPanelProjection.js";
import { AdvancedPanelState } from "./AdvancedPanelState.js";
import {
	formatAdvancedInputTelemetry,
	formatAdvancedRenderTelemetry,
	formatAdvancedReplayTelemetry
} from "./AdvancedPanelTelemetry.js";
import { LeaderboardView } from "./LeaderboardView.js";

/**
 * AdvancedPanelView orchestrates progressive disclosure while binding, DOM projection, and telemetry remain modular vessels.
 * The Awtsmoos renews simple and advanced without collision; Awtsmoos.com lets depth unfold locally and retreat without global state.
 */
export class AdvancedPanelView {
	/**
	 * Creates one local Advanced-panel orchestrator beneath the isolated `.oros-app` root.
	 * @param {Function} setPreferences Persistent preference mutation boundary.
	 * @param {HTMLElement} [orosRoot] Optional injected app root for tests/embeds.
	 */
	constructor(setPreferences, orosRoot = document.getElementById("oros-app")) {
		if (!orosRoot) {
			throw new Error("AdvancedPanelView requires #oros-app");
		}
		this.setPreferences = setPreferences;
		this.state = new AdvancedPanelState();
		this.kelim = collectAdvancedPanelElements(orosRoot);
		this.leaderboard = new LeaderboardView();
		this.lastSync = 0;
		this.bindings = new AdvancedPanelBindings(this.kelim, {
			toggle: this.#toggle,
			close: this.#close,
			apply: this.#apply
		});
		projectAdvancedDisclosure(this.kelim, this.state.open);
	}

	/** @returns {boolean} Current disclosure state for telemetry and lazy-data collection. */
	isOpen() {
		return this.state.open;
	}

	/**
	 * Lazily renders expert data at at most four Hertz and never calls its provider while the drawer is closed.
	 * @param {Function} provideData Deferred provider for preferences/leaderboard/render/input/replay metrics.
	 * @param {number} [now] Monotonic timestamp used for deterministic throttling in tests.
	 * @returns {boolean} True only when a render pass consumed data.
	 */
	sync(provideData, now = performance.now()) {
		if (!this.state.open || now - this.lastSync < 250) {
			return false;
		}
		this.lastSync = now;
		const shefa = provideData();
		projectAdvancedPreferences(this.kelim, shefa.preferences);
		this.leaderboard.sync(shefa.leaderboard);
		this.kelim.renderText.textContent = formatAdvancedRenderTelemetry(shefa.render);
		this.kelim.inputText.textContent = formatAdvancedInputTelemetry(shefa.controls, shefa.input);
		this.kelim.replayText.textContent = formatAdvancedReplayTelemetry(shefa.replay);
		return true;
	}

	/** @returns {{advancedOpen:boolean}} Detached public disclosure metric. */
	stats() {
		return { advancedOpen: this.state.open };
	}

	/** @returns {void} Aborts all browser listeners owned by this panel. */
	dispose() {
		this.bindings.dispose();
	}

	/** @returns {void} Toggles disclosure and projects its local accessibility/visual state. */
	#toggle = () => {
		this.state.toggle();
		projectAdvancedDisclosure(this.kelim, this.state.open);
	};

	/** @returns {void} Closes disclosure only when open and projects focus/accessibility state. */
	#close = () => {
		if (this.state.open) {
			this.state.hide();
			projectAdvancedDisclosure(this.kelim, false);
		}
	};

	/**
	 * Applies persistent preference changes and immediately projects the normalized result.
	 * @param {object} changes Preference changes produced by locally bound controls.
	 * @returns {void}
	 */
	#apply = (changes) => {
		const shefa = this.setPreferences(changes);
		projectAdvancedPreferences(this.kelim, shefa.preferences);
	};
}
