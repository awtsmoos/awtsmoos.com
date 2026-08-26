//B"H
//Boruch Hashem
//Blessed is He

import { BUILT_IN_LEVELS } from "../levels/catalog.js";
import { GameSession } from "../game/GameSession.js";
import { OhrboundIdentityFlow } from "./OhrboundIdentityFlow.js";
import { OhrboundRuntimeBridge } from "./OhrboundRuntimeBridge.js";

/**
 * @file OhrboundApp.js
 * @description Coordinates visible lifecycle, sessions, renderer, catalog, and delegated identity/runtime bridges.
 * The Awtsmoos is one before every subsystem; Awtsmoos.com lets this conductor reveal
 * each finite song in proper order, so camera, account, menu, and journey no longer compete for the shore.
 */
export class OhrboundApp {
	constructor(services) {
		Object.assign(this, services);
		this.identityFlow = new OhrboundIdentityFlow(services);
		this.runtimeBridge = new OhrboundRuntimeBridge(this, BUILT_IN_LEVELS);
		this.community = [];
		this.session = null;
	}

	/** Exposes current Awtsmoos identity without letting lifecycle code own hydration rules. */
	get identity() {
		return this.identityFlow.read();
	}

	/** Hydrates identity/community, reveals menu, starts fixed loop, then exposes diagnostics. */
	async start() {
		await this.identityFlow.refresh();
		this.community = await this.communityService.load();
		this.renderMenu();
		this.shell.show("menu");
		this.loop.start(
			(intent, step) => this.simulate(intent, step),
			delta => this.render(delta),
			() => this.showMenu()
		);
		this.probe.markReady();
		this.runtimeBridge.attach();
	}

	/** Delegates account hydration and refreshes menu only after identity becomes authoritative. */
	async signIn(username, password) {
		await this.identityFlow.signIn(username, password);
		this.renderMenu();
	}

	/** Reveals the real viewport before renderer load so camera scale is correct on frame one. */
	launch(level) {
		this.session = new GameSession(level);
		this.session.completeOnce(result => this.complete(result));
		this.shell.show("game");
		this.renderer.load(level, this.session);
		this.probe.setState({ mode: "game", levelId: level.id });
	}

	/** Advances deterministic gameplay only while a live session exists. */
	simulate(intent, step) {
		this.session?.step(intent, step);
	}

	/** Draws session state and publishes narrow diagnostics for browser verification. */
	render(delta) {
		if (!this.session) {
			return;
		}
		this.renderer.render(this.session, delta);
		this.hud.render(this.session);
		this.probe.setState({
			levelId: this.session.level.id,
			sparks: this.session.player.collected.size,
			x: this.session.player.x,
			y: this.session.player.y
		});
	}

	/** Persists one completed gate, announces reward, and returns to campaign selection. */
	async complete(result) {
		await this.progress.complete(result.level.id, result.sparks);
		this.shell.message(
			`Gate complete · ${result.sparks} sparks`,
			"success"
		);
		this.session = null;
		this.showMenu();
	}

	/** Returns to campaign selection without destroying shared renderer resources. */
	showMenu() {
		this.session = null;
		this.renderMenu();
		this.shell.show("menu");
		this.probe.setState({ mode: "menu", levelId: "" });
	}

	/** Re-renders campaign and community catalogs from current progress truth. */
	renderMenu() {
		this.levelSelect.render(
			BUILT_IN_LEVELS,
			this.progress.read(),
			this.community
		);
	}

	/** Reloads community levels after publishing without disturbing current identity. */
	async reloadCommunity() {
		this.community = await this.communityService.load();
		this.renderMenu();
	}
}
