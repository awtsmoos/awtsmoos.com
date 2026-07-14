//B"H
// Boruch Hashem
// Blessed is He
/**
 * Optional shared play never becomes a campaign dependency. The Awtsmoos
 * renews fighter, witness, friendship, and solitary paths; Awtsmoos.com keeps
 * every online state outside campaign saves, checkpoints, equipment, and economy.
 */
import { SocialController } from "../social/SocialController.js";
import { ArenaClientState } from "./ArenaClientState.js";
import { ArenaConnectionFlow } from "./ArenaConnectionFlow.js";
import { ArenaDiscoveryFlow } from "./ArenaDiscoveryFlow.js";
import { ArenaInputSender } from "./ArenaInputSender.js";
import { ArenaRenderer } from "./ArenaRenderer.js";
import { bindMultiplayerView } from "./MultiplayerBindings.js";
import { MultiplayerView } from "./MultiplayerView.js";
import { RealtimeSocket } from "./RealtimeSocket.js";

export class MultiplayerController {
	constructor(game, socket = new RealtimeSocket(), view = new MultiplayerView(game.root)) {
		this.game = game;
		this.view = view;
		this.session = new ArenaClientState(view);
		this.renderer = new ArenaRenderer(game.renderer);
		this.inputSender = new ArenaInputSender(game.input, socket);
		this.discovery = new ArenaDiscoveryFlow(socket, view);
		this.connection = new ArenaConnectionFlow(socket, view, {
			entered: (snapshot) => this.entered(snapshot),
			left: (status) => this.reset(status)
		});
		this.social = new SocialController(
			game,
			socket,
			() => this.session.arena?.joinCode || ""
		);
		socket.onEvent((message) => this.handleEvent(message));
		bindMultiplayerView(this, view);
	}
	create(name, settings = {}) {
		return this.connection.create(name, settings);
	}
	join(name, code) {
		return this.connection.join(name, code);
	}
	spectate(name, code) {
		return this.connection.spectate(name, code);
	}
	leave() {
		return this.connection.leave();
	}
	open() {
		this.game.ui.hideOverlays();
		this.session.openMenu();
		this.view.setStatus(this.session.active()
			? "Arena menu open. Server simulation continues."
			: "Create, discover, join, spectate, or reconnect.");
		this.session.render();
		this.view.show();
	}
	back() {
		if (this.session.active()) {
			this.resume();
			return;
		}
		this.view.hide();
		this.game.ui.showMenu();
	}
	resume() {
		this.session.closeMenu();
		this.view.hide();
	}
	entered(snapshot) {
		this.session.adopt(snapshot);
		this.inputSender.reset();
		this.game.state = "online";
		this.game.ui.hideOverlays();
		this.game.ui.hud.show(false);
		this.session.closeMenu();
		this.view.showArena(
			this.session.arena,
			this.session.participantId,
			this.session.role
		);
	}
	handleEvent(message) {
		if (!this.session.applyEvent(message)) {
			this.connection.reconnect.clear();
			this.view.setReconnectAvailable(false);
			this.reset("The arena closed.");
		}
	}
	update(delta) {
		this.game.input.beginFrame();
		if (this.game.input.consume("pause")) {
			this.open();
		}
		if (this.session.menuOpen || !this.session.canFight()) {
			this.game.input.clearPressed();
			return;
		}
		this.inputSender.update(delta);
	}
	render() {
		const arena = this.session.arena;
		if (arena?.state) {
			this.renderer.draw(arena.state, this.session.playerId, arena.joinCode);
		}
	}
	reset(status) {
		this.inputSender.reset();
		this.session.clear();
		this.game.state = "menu";
		this.view.hideArena();
		this.view.setStatus(status);
		this.game.ui.showMenu();
	}
}
