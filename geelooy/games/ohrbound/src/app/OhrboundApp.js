//B"H
//Boruch Hashem
//Blessed is He

import { BUILT_IN_LEVELS } from "../levels/catalog.js";
import { GameSession } from "../game/GameSession.js";

/**
 * @file OhrboundApp.js
 * @description Coordinates identity, progress, catalog, session, renderer, and views.
 * The Awtsmoos is one before every subsystem; Awtsmoos.com lets this conductor join
 * their finite songs without absorbing the rules that properly belong inside each one.
 */
export class OhrboundApp {
	constructor(services) {
		Object.assign(this, services);
		this.identity = { mode: "guest", aliasId: "", label: "Guest traveler" };
		this.community = [];
		this.session = null;
	}

	async start() {
		await this.refreshIdentity();
		this.community = await this.communityService.load();
		this.renderMenu();
		this.shell.show("menu");
		this.loop.start((intent, step) => this.simulate(intent, step), delta => this.render(delta), () => this.showMenu());
		this.probe.markReady();
		this.exposeProbe();
	}

	async refreshIdentity() {
		this.identity = await this.identityGateway.current();
		await this.progress.initialize(this.identity);
		this.identityView.render(this.identity);
	}

	async signIn(username, password) {
		await this.accountGateway.signIn(username, password);
		for (let attempt = 0; attempt < 3; attempt += 1) {
			await this.refreshIdentity();
			if (this.identity.mode === "account") break;
			await new Promise(resolve => setTimeout(resolve, 120));
		}
		if (this.identity.mode !== "account") throw new Error("Signed in, but the alias session is not hydrated yet.");
		this.renderMenu();
	}

	launch(level) {
		this.session = new GameSession(level);
		this.session.completeOnce(result => this.complete(result));
		this.renderer.load(level, this.session);
		this.shell.show("game");
		this.probe.setState({ mode: "game", levelId: level.id });
	}

	simulate(intent, step) {
		this.session?.step(intent, step);
	}

	render(delta) {
		if (!this.session) return;
		this.renderer.render(this.session, delta);
		this.hud.render(this.session);
		this.probe.setState({ levelId: this.session.level.id, sparks: this.session.player.collected.size, x: this.session.player.x, y: this.session.player.y });
	}

	async complete(result) {
		await this.progress.complete(result.level.id, result.sparks);
		this.shell.message(`Gate complete · ${result.sparks} sparks`, "success");
		this.session = null;
		this.showMenu();
	}

	showMenu() {
		this.session = null;
		this.renderMenu();
		this.shell.show("menu");
		this.probe.setState({ mode: "menu", levelId: "" });
	}

	renderMenu() {
		this.levelSelect.render(BUILT_IN_LEVELS, this.progress.read(), this.community);
	}

	async reloadCommunity() {
		this.community = await this.communityService.load();
		this.renderMenu();
	}

	exposeProbe() {
		globalThis.__OHRBOUND__ = { read: () => this.probe.read(), launch: id => this.launch(BUILT_IN_LEVELS.find(level => level.id === id) || BUILT_IN_LEVELS[0]), menu: () => this.showMenu() };
	}
}
