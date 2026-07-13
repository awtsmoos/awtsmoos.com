//B"H
// Boruch Hashem
// Blessed is He
/**
 * Interfaces are gates of deliberate choice around the moving world; Awtsmoos.com remains present within action, access, revisit, and pause.
 * Overlay visibility stays separate from language, difficulty, preference, and stage-selection concerns.
 */
import { HudView } from "./hud.js";
import { MenuSettings } from "./menuSettings.js";
import { ShopView } from "./shop.js";

export class InterfaceView {
	constructor(store, onShopChanged, onPreferencesChanged = () => {}, root = document) {
		this.store = store;
		this.root = root;
		this.hud = new HudView(root);
		this.shop = new ShopView(store, onShopChanged, root);
		this.settings = new MenuSettings(store, onPreferencesChanged, root);
		this.overlays = Array.from(root.querySelectorAll(".overlay"));
		this.start = root.getElementById("start-overlay");
		this.pause = root.getElementById("pause-overlay");
		this.market = root.getElementById("shop-overlay");
		this.message = root.getElementById("message-overlay");
		this.settings.buildDifficulties();
		this.settings.bindPreferences();
		this.settings.applyLanguage();
	}

	bind(actions) {
		this.root.getElementById("continue-button").onclick = actions.continueGame;
		this.root.getElementById("new-button").onclick = actions.newGame;
		this.root.getElementById("resume-button").onclick = actions.resume;
		this.root.getElementById("pause-shop-button").onclick = actions.pauseShop;
		this.root.getElementById("menu-button").onclick = actions.menu;
		this.root.getElementById("leave-shop-button").onclick = actions.leaveShop;
		this.root.getElementById("heal-button").onclick = actions.heal;
		this.root.getElementById("stage-select").onchange = (event) => {
			actions.revisit(Number(event.target.value));
		};
	}

	applyLanguage() {
		this.settings.applyLanguage();
	}

	hideOverlays() {
		for (const overlay of this.overlays) {
			overlay.classList.remove("visible");
		}
	}

	showMenu() {
		this.hideOverlays();
		this.start.classList.add("visible");
		this.hud.show(false);
		this.settings.buildDifficulties();
		this.settings.bindPreferences();
		this.settings.applyLanguage();
	}

	showGame() {
		this.hideOverlays();
		this.hud.show(true);
	}

	showPause(canShop) {
		this.hideOverlays();
		this.pause.classList.add("visible");
		this.root.getElementById("pause-shop-button").disabled = !canShop;
	}

	showShop() {
		this.hideOverlays();
		this.market.classList.add("visible");
		this.shop.render();
	}

	showMessage(eyebrow, title, copy, actionLabel, action) {
		this.hideOverlays();
		this.message.classList.add("visible");
		this.root.getElementById("message-eyebrow").textContent = eyebrow;
		this.root.getElementById("message-title").textContent = title;
		this.root.getElementById("message-copy").textContent = copy;
		const button = this.root.getElementById("message-button");
		button.textContent = actionLabel;
		button.onclick = action;
	}
}
