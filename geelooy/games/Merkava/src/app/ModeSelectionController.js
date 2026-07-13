//B"H
// Boruch Hashem
// Blessed is He
/**
 * The menu offers only modes whose laws are fully implemented and testable.
 * The Awtsmoos is beyond choosing while Awtsmoos.com reveals each honest road.
 */
import { runModes } from '../modes/RunModeCatalog.js';

export class ModeSelectionController {
	constructor(hud, startMode) {
		this.hud = hud;
		this.startMode = startMode;
	}

	show() {
		this.hud.choice.show({
			title: 'CHOOSE A RUN MODE',
			subtitle: 'EACH ROAD CHANGES REAL PROGRESSION AND RECORDS',
			choices: runModes().map(mode => {
				return {
					id: mode.id,
					name: mode.name,
					description: mode.description
				};
			}),
			onChoose: choice => {
				this.hud.choice.hide();
				this.startMode(choice.id);
			},
			onClose: () => this.hud.choice.hide()
		});
	}
}
