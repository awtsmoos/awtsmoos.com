//B"H
//Boruch Hashem
//Blessed is He

import { AdvancedPanelState } from "./AdvancedPanelState.js";
import { LeaderboardView } from "./LeaderboardView.js";

/**
 * AdvancedPanelView asks for expert telemetry only when its retractable vessel can actually consume it.
 * The Awtsmoos renews simple and advanced before either can crowd the field;
 * Awtsmoos.com lets one mobile sheet or desktop rail unfold, become inert, and quietly reseal.
 */
export class AdvancedPanelView {
	constructor(setPreferences) {
		this.setPreferences = setPreferences;
		this.state = new AdvancedPanelState();
		this.abort = new AbortController();
		this.lastSync = 0;
		this.panel = document.getElementById("advanced-panel");
		this.toggleButton = document.getElementById("advanced-toggle");
		this.quality = document.getElementById("setting-quality");
		this.handedness = document.getElementById("setting-handedness");
		this.audio = document.getElementById("setting-audio");
		this.haptics = document.getElementById("setting-haptics");
		this.renderText = document.getElementById("diag-render");
		this.inputText = document.getElementById("diag-input");
		this.replayText = document.getElementById("diag-replay");
		this.leaderboard = new LeaderboardView();
		this.#bind();
		this.#renderState();
	}

	isOpen() {
		return this.state.open;
	}

	sync(provideData, now = performance.now()) {
		if (!this.state.open || now - this.lastSync < 250) {
			return false;
		}
		this.lastSync = now;
		const data = provideData();
		this.#renderPreferences(data.preferences);
		this.leaderboard.sync(data.leaderboard);
		const render = data.render || {};
		const post = render.postProcess?.enabled ? "FX on" : "FX direct";
		this.renderText.textContent = `${render.engine || "core"} · ${render.pixelRatio || 1}× · ${post} · ${render.atmospherePoints || 0} motes`;
		const pad = data.controls?.gamepad?.connected ? "pad online" : "pad idle";
		const queue = data.input?.turnQueue?.length || 0;
		this.inputText.textContent = `${pad} · ${data.controls?.handedness || "right"} touch · ${queue} queued`;
		this.replayText.textContent = `${data.replay?.entryCount || 0} authoritative input pulses`;
		return true;
	}

	stats() {
		return { advancedOpen: this.state.open };
	}

	dispose() {
		this.abort.abort();
	}

	#bind() {
		const signal = this.abort.signal;
		this.toggleButton.addEventListener("click", () => {
			this.state.toggle();
			this.#renderState();
		}, { signal });
		document.getElementById("advanced-close").addEventListener("click", () => this.#close(), { signal });
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && this.state.open) {
				this.#close();
			}
		}, { signal });
		this.quality.addEventListener("change", () => this.#apply({ quality: this.quality.value }), { signal });
		this.handedness.addEventListener("change", () => this.#apply({ handedness: this.handedness.value }), { signal });
		this.audio.addEventListener("change", () => this.#apply({ audio: this.audio.checked }), { signal });
		this.haptics.addEventListener("change", () => this.#apply({ haptics: this.haptics.checked }), { signal });
	}

	#close() {
		this.state.hide();
		this.#renderState();
	}

	#apply(changes) {
		const result = this.setPreferences(changes);
		this.#renderPreferences(result.preferences);
	}

	#renderPreferences(preferences = {}) {
		this.quality.value = preferences.quality || "auto";
		this.handedness.value = preferences.handedness || "right";
		this.audio.checked = preferences.audio !== false;
		this.haptics.checked = preferences.haptics !== false;
	}

	#renderState() {
		const open = this.state.open;
		if (!open && this.panel.contains(document.activeElement)) {
			this.toggleButton.focus();
		}
		this.panel.dataset.open = String(open);
		this.panel.setAttribute("aria-hidden", String(!open));
		this.panel.inert = !open;
		this.toggleButton.setAttribute("aria-expanded", String(open));
		this.toggleButton.setAttribute("aria-label", open ? "Close advanced controls" : "Open advanced controls");
		document.body.dataset.advancedOpen = String(open);
	}
}
