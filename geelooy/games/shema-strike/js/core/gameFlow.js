//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign flow carries the traveler through authored gates, defeat, ending, and endless return while Awtsmoos.com renews every threshold.
 * Final victory is persisted before presentation, and checkpoint retry never pretends that an unrecorded deed survived.
 */
import { completionBonus } from "../economy/campaignEconomy.js";
import { createStageSession } from "./stageSessionFactory.js";

export class GameFlow {
	startCampaign(reset) {
		this.audio.awaken();
		if (reset) {
			this.store.reset(this.store.data.difficulty);
		}
		this.loadStage(this.store.data.currentStage || 1);
	}

	loadStage(stageNumber, retrySnapshot = null) {
		this.stageNumber = Math.max(1, stageNumber);
		const session = createStageSession(
			this,
			this.stageNumber,
			retrySnapshot
		);
		this.scene = session.scene;
		this.player = session.player;
		this.runtime = session.runtime;
		this.checkpointSnapshot = session.checkpointSnapshot;
		this.camera.x = 0;
		this.state = "playing";
		this.shopReturn = "playing";
		this.ui.showGame();
		this.ui.hud.update(this.player, this.scene, this.store.data);
	}

	completeStage() {
		if (this.state !== "playing") {
			return;
		}
		this.state = "message";
		this.checkpointSnapshot = null;
		const bonus = completionBonus(
			this.stageNumber,
			this.player.fortune
		);
		this.store.addCoins(bonus);
		this.store.completeStage(this.stageNumber);
		this.audio.gate();
		if (this.stageNumber === 27) {
			this.showCampaignEnding(bonus);
			return;
		}
		const endless = this.stageNumber > 27;
		this.ui.showMessage(
			endless ? "ENDLESS DEPTH COMPLETE" : "GATE COMPLETE",
			endless ? "The Road Continues" : "Light Revealed",
			`${endless ? "Depth" : "Gate"} ${this.stageNumber} opened. Bonus: ${bonus} perutas.`,
			"ENTER NIGHT MARKET",
			() => this.openShop(false)
		);
	}

	showCampaignEnding(bonus) {
		this.ui.showMessage(
			"ALL TWENTY-SEVEN GATES REVEALED",
			"The Gate Beyond Gates",
			`Every gate remains revisitable, and the endless road is awake. Final bonus: ${bonus} perutas.`,
			"ENTER THE ENDLESS ROAD",
			() => this.loadStage(28)
		);
	}

	defeat() {
		if (this.state !== "playing") {
			return;
		}
		this.state = "message";
		const detail = this.checkpointSnapshot
			? "The central lamp remembers your path and checkpoint progress."
			: "Your equipment and perutas remain for another attempt.";
		this.ui.showMessage(
			"THE VESSEL FELL",
			"Rise Again",
			detail,
			"RETRY GATE",
			() => this.loadStage(this.stageNumber, this.checkpointSnapshot)
		);
	}
}
