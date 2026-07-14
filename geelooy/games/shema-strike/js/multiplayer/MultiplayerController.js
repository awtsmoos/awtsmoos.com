//B"H
// Boruch Hashem
// Blessed is He
/**
 * Optional shared play never becomes a campaign dependency. The Awtsmoos
 * renews both paths; Awtsmoos.com keeps online state outside saves and economy.
 */
import { ArenaClientState } from "./ArenaClientState.js";
import { ArenaConnectionFlow } from "./ArenaConnectionFlow.js";
import { ArenaInputSender } from "./ArenaInputSender.js";
import { ArenaRenderer } from "./ArenaRenderer.js";
import { MultiplayerView } from "./MultiplayerView.js";
import { RealtimeSocket } from "./RealtimeSocket.js";
export class MultiplayerController {
	constructor(game, socket = new RealtimeSocket(), view = new MultiplayerView(game.root)) {
		this.game = game;
		this.view = view;
		this.session = new ArenaClientState(view);
		this.renderer = new ArenaRenderer(game.renderer);
		this.inputSender = new ArenaInputSender(game.input, socket);
		this.connection = new ArenaConnectionFlow(socket, view, {
			entered: (snapshot) => this.entered(snapshot),
			left: (status) => this.reset(status)
		});
		socket.onEvent((message) => this.handleEvent(message));
		this.bindView();
	}

	bindView() {
		this.view.bind({
			back: () => this.back(),
			create: (name) => this.create(name),
			join: (name, code) => this.join(name, code),
			leave: () => this.leave(),
			open: () => this.open(),
			resume: () => this.resume()
		});
	}

	open() {
		this.game.ui.hideOverlays();
		this.session.openMenu();
		this.view.setStatus(this.session.active()
			? "Arena menu open. The match continues on the server."
			: "Choose an arena action.");
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

	create(name) {
		return this.connection.create(name);
	}

	join(name, joinCode) {
		return this.connection.join(name, joinCode);
	}

	leave() {
		return this.connection.leave();
	}

	entered(snapshot) {
		this.session.adopt(snapshot);
		this.inputSender.reset();
		this.game.state = "online";
		this.game.ui.hideOverlays();
		this.game.ui.hud.show(false);
		this.session.closeMenu();
		this.view.showArena(this.session.arena, this.session.playerId);
	}

	handleEvent(message) {
		if (!this.session.applyEvent(message)) {
			this.reset("The arena closed.");
		}
	}

	update(delta) {
		this.game.input.beginFrame();
		if (this.game.input.consume("pause")) {
			this.open();
		}
		if (this.session.menuOpen) {
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
