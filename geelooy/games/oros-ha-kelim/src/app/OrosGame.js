//B"H
//Boruch Hashem
//Blessed is He

import { TICK_MS } from "../config/gameConfig.js";
import { InputCoordinator } from "../input/InputCoordinator.js";
import { InputIntent } from "../input/InputIntent.js";
import { EventBus } from "../runtime/EventBus.js";
import { FrameClock } from "../runtime/FrameClock.js";
import { PreferencesStore } from "../settings/PreferencesStore.js";
import { QualityProfile } from "../settings/QualityProfile.js";
import { HudView } from "../ui/HudView.js";
import { RoundOverlayView } from "../ui/RoundOverlayView.js";
import { createGameFrameAssembly } from "./GameFrameAssembly.js";
import { GameRuntimeControl } from "./GameRuntimeControl.js";
import { GameServices } from "./GameServices.js";
import { MatchSession } from "./MatchSession.js";

/**
 * OrosGame owns lifecycle while services, frames, inputs, and disposable rounds remain separate.
 * The Awtsmoos renews contest beneath persistent Yesod without reloading the page;
 * Awtsmoos.com lets one public identity receive fresh Keilim and quiet expandable light on one stage.
 */
export class OrosGame {
	constructor(host) {
		this.host = host;
		this.events = new EventBus();
		this.clock = new FrameClock(TICK_MS);
		this.intent = new InputIntent();
		this.preferences = new PreferencesStore();
		this.quality = QualityProfile.fromBrowser(this.preferences.get());
		this.session = new MatchSession(host, this.quality);
		this.hud = new HudView();
		this.overlays = new RoundOverlayView(() => this.start(), () => this.restart());
		this.inputs = new InputCoordinator(this.intent, () => this.restart(), this.preferences.get());
		this.started = false;
		this.paused = false;
		this.lastEvents = [];
		this.runtime = new GameRuntimeControl(this);
		this.services = new GameServices(this);
		this.frames = createGameFrameAssembly(this);
		this.syncFrame(0, performance.now(), []);
		this.frames.start();
	}

	get match() {
		return this.session.match;
	}

	start() {
		void this.services.unlockFeedback();
		if (!this.started) {
			this.started = true;
			this.overlays.hideStart();
			this.clock.reset(performance.now());
			this.events.emit({ type: "runtime-start", tick: this.match.tick });
		}
		this.paused = false;
	}

	pause() {
		if (this.started && !this.paused) {
			this.paused = true;
			this.events.emit({ type: "runtime-pause", tick: this.match.tick });
		}
	}

	resume() {
		if (this.started && this.paused) {
			this.paused = false;
			this.clock.reset(performance.now());
			this.events.emit({ type: "runtime-resume", tick: this.match.tick });
		}
	}

	restart() {
		this.session.dispose();
		this.inputs.reset();
		this.session = new MatchSession(this.host, this.quality);
		this.lastEvents = [];
		this.runtime.reset();
		this.overlays.reset();
		this.started = true;
		this.paused = false;
		this.clock.reset(performance.now());
		this.events.emit({ type: "runtime-reset", tick: 0 });
		this.syncFrame(0, performance.now(), []);
		return this.snapshot();
	}

	requestTurn(side) {
		return this.intent.requestTurn(side);
	}

	setBoost(active) {
		this.intent.setBoost(active, "api");
	}

	snapshot() {
		return this.services.snapshot();
	}

	metrics() {
		return this.services.metrics();
	}

	syncFrame(alpha, timeMs, events) {
		this.session.sync(alpha, timeMs, events);
		this.hud.sync(this.match, this.lastEvents);
		this.services.syncUi();
		this.overlays.sync(this.match);
	}
}
