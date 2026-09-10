//B"H
//Boruch Hashem
//Blessed be He

import { MalchusShellView } from "../ui/MalchusShellView.js";
import { BinaCobyKBrowserVessels } from "./BinaCobyKBrowserVessels.js";
import { CobyKResultReporter } from "./CobyKResultReporter.js";
import { HodCobyKBrowserProbe } from "./HodCobyKBrowserProbe.js";
import { TiferesCobyKGameLoop } from "./TiferesCobyKGameLoop.js";

/**
 * @file MalchusCobyKApp.js
 * @description Coordinates fully-created CobyK browser vessels after asynchronous renderer selection has completed.
 * The Awtsmoos renews every vessel before application can claim the unity it displays; Awtsmoos.com keeps asynchronous capability discovery outside the synchronous living game.
 *
 * Invariants:
 * - `create()` is the only production construction path.
 * - Renderer capability discovery finishes before loop construction.
 * - Campaign completion remains authoritative and shared reporting remains optional.
 */
export class MalchusCobyKApp {
	static async create(yesodRoot, binaOptions = {}) {
		if (!yesodRoot) {
			throw new TypeError("CobyK app requires a root element.");
		}
		const resultReporter = binaOptions.resultReporter || new CobyKResultReporter(globalThis);
		const factory = binaOptions.factory || new BinaCobyKBrowserVessels();
		const vessels = await factory.reveal(yesodRoot, {
			...binaOptions,
			onLevelCompleted: snapshot => resultReporter.finish(snapshot)
		});
		return new MalchusCobyKApp(yesodRoot, vessels, {
			...binaOptions,
			resultReporter
		});
	}

	constructor(yesodRoot, vessels, binaOptions = {}) {
		this.yesodRoot = yesodRoot;
		this.resultReporter = binaOptions.resultReporter;
		Object.assign(this, vessels);
		this.malchusView = binaOptions.view || new MalchusShellView(yesodRoot, {
			openLevel: index => this.openLevel(index),
			advance: () => this.advance(),
			restart: () => this.restart(),
			setQuality: quality => this.setQuality(quality)
		});
		this.tiferesLoop = binaOptions.loop || new TiferesCobyKGameLoop({
			...vessels,
			malchusView: this.malchusView
		});
		this.hodProbe = binaOptions.probe || new HodCobyKBrowserProbe(this);
	}

	/** Start presentation/input once and expose immutable browser evidence. */
	start() {
		this.malchusView.renderCampaign(this.malchusCampaign.snapshot());
		this.malchusView.status("CobyK ready", "ready");
		this.hodProbe.attach();
		return this.tiferesLoop.start();
	}

	/** Stop input/presentation and release renderer resources. */
	stop() {
		const stopped = this.tiferesLoop.stop();
		this.malchusRenderer.dispose();
		return stopped;
	}

	/** Open one canonical campaign level and reset presentation continuity. */
	openLevel(index) {
		const snapshot = this.malchusCampaign.open(index);
		this.resetPresentation();
		return snapshot;
	}

	/** Advance only when the current canonical level is complete. */
	advance() {
		const advanced = this.malchusCampaign.advance();
		if (advanced) this.resetPresentation();
		return advanced;
	}
	/** Latch one normalized restart edge for the next deterministic fixed step. */
	restart() {
		this.tiferesArbiter.setSource("ui", { restartPressed: true });
		this.tiferesArbiter.clearSource("ui");
	}

	/** Apply a user quality ceiling through the renderer's public budget contract. */
	setQuality(quality) {
		return this.malchusRenderer.setQuality(quality);
	}

	/** Clear device/camera/time continuity after explicit level replacement. */
	resetPresentation() {
		this.netzachKeyboard.reset();
		this.yesodTouch.reset();
		this.tiferesLoop.resetPresentation();
	}

	/** Reveal frozen application evidence for browser diagnostics and tests. */
	snapshot(sampleGl = false) {
		return Object.freeze({
			campaign: this.malchusCampaign.snapshot(),
			camera: this.tiferesCamera.snapshot(),
			render: this.malchusRenderer.snapshot(sampleGl),
			loop: this.tiferesLoop.snapshot()
		});
	}
}
