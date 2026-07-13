//B"H
// Boruch Hashem
// Blessed is He
/**
 * Checkpoints and blessings interrupt speed so one decision can reshape the run.
 * The Awtsmoos is beyond choosing while Awtsmoos.com reveals consequence and return.
 */
import { PermanentUpgradeController } from './PermanentUpgradeController.js';

export class RunChoiceController {
	constructor(systems, hud) {
		this.systems = systems;
		this.hud = hud;
		this.activeToken = null;
		this.permanent = new PermanentUpgradeController(systems, hud);
	}

	update() {
		const state = this.systems.state;
		if (!state.transitionRequest || this.activeToken === state.transitionRequest) {
			return;
		}
		this.activeToken = state.transitionRequest;
		if (state.transitionRequest === 'shop') {
			this.openCheckpoint();
		} else {
			this.showBlessing(state.transitionRequest === 'major-blessing');
		}
	}

	openCheckpoint() {
		if (!this.systems.state.abilityChosen) {
			this.showAbilityChoice();
			return;
		}
		this.showShop();
	}

	showAbilityChoice() {
		this.hud.choice.show({
			title: 'CHOOSE A MERKAVA COMMAND',
			subtitle: 'THE ABILITY CHARGES THROUGH COMBAT AND PRUTAHS',
			choices: this.systems.abilities.choices(),
			onChoose: choice => {
				this.systems.abilities.choose(this.systems.state, choice.id);
				this.showShop();
			}
		});
	}

	showShop() {
		const state = this.systems.state;
		this.hud.choice.show({
			title: 'CHECKPOINT SHRINE',
			subtitle: `${state.prutahs} PRUTAHS · PRICES RISE WITH EACH PURCHASE`,
			choices: this.systems.upgrades.offers(state),
			onChoose: choice => this.purchase(choice),
			onClose: () => this.continueRun()
		});
	}

	purchase(choice) {
		const result = this.systems.upgrades.purchase(this.systems.state, choice.id);
		this.hud.notify(result.ok ? `${choice.name.toUpperCase()} ACQUIRED` : result.reason);
		this.showShop();
	}

	showBlessing(major) {
		const state = this.systems.state;
		this.hud.choice.show({
			title: major ? 'MAJOR SEFIRAH REVELATION' : 'BLESSING FRAGMENTS UNITED',
			subtitle: major ? 'THE WORLD SHELL HAS BROKEN' : 'CHOOSE THE BUILD PATH',
			choices: this.systems.blessings.choices(state, major),
			onChoose: choice => {
				this.systems.blessings.apply(state, choice.id);
				this.continueRun();
			}
		});
	}

	continueRun() {
		this.hud.choice.hide();
		this.activeToken = null;
		this.systems.campaign.continueChoice(this.systems.state);
		this.systems.save = this.systems.saves.storeCheckpoint(
			this.systems.save,
			this.systems.state
		);
	}

	showPermanent() {
		this.permanent.show();
	}
}
