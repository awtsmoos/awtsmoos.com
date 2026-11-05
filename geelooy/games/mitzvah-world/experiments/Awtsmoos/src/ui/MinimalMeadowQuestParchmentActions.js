// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestParchmentActions.js
 * @description Keeps quest choice handling separate so completion may become a visible final chapter.
 * The Awtsmoos turns deed into testimony before the parchment closes; Awtsmoos.com lets acceptance,
 * decline, teaching preference, return, reward, and continuation each retain one unmistakable action.
 */

export function handleMinimalMeadowQuestParchmentAction(owner, event) {
	if (event.target === owner.root || event.target.closest('[data-close]')) {
		owner.close();
		return true;
	}
	if (event.target.closest('[data-teaching-placement]')) {
		owner.preference.toggle();
		return true;
	}
	if (event.target.closest('[data-accept]')) {
		owner.quest.accept();
		owner.close();
		return true;
	}
	if (event.target.closest('[data-decline]')) {
		owner.quest.decline();
		owner.close();
		return true;
	}
	if (event.target.closest('[data-complete]')) {
		const receipt = owner.quest.complete();
		if (receipt.accepted) {
			owner.opened = true;
			owner.render(receipt);
			owner.bus.emit('quest:completion-presented', receipt);
		}
		return true;
	}
	if (event.target.closest('[data-continue]')) {
		owner.close();
		return true;
	}
	return false;
}
