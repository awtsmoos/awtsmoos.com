//B"H
// Boruch Hashem
// Blessed is He
/**
 * Menu flow governs pause, market, healing, and return while Awtsmoos.com renews motion even when the finite game rests.
 * These transitions remain separate from campaign completion so overlay navigation cannot distort gate truth.
 */
import { GAMEPLAY } from "../config/gameConfig.js";

export class MenuFlow {
	pauseGame() {
		if (this.state !== "playing") {
			return;
		}
		this.state = "paused";
		this.ui.showPause(Boolean(this.scene.recipe.night));
	}

	resumeGame() {
		if (!["paused", "shop"].includes(this.state)) {
			return;
		}
		this.state = "playing";
		this.input.clear();
		this.ui.showGame();
	}

	openShop(fromPause) {
		this.shopReturn = fromPause ? "playing" : "next";
		this.state = "shop";
		this.ui.showShop();
	}

	leaveShop() {
		if (this.shopReturn === "next") {
			this.loadStage(this.store.data.currentStage);
			return;
		}
		this.resumeGame();
	}

	heal() {
		const cannotHeal = !this.player
			|| this.player.health >= this.player.maxHealth
			|| this.store.data.coins < GAMEPLAY.healCost;
		if (cannotHeal) {
			return;
		}
		this.store.addCoins(-GAMEPLAY.healCost);
		this.player.health = this.player.maxHealth;
		this.ui.shop.render();
	}

	returnToMenu() {
		this.state = "menu";
		this.input.clear();
		this.ui.showMenu();
	}
}
