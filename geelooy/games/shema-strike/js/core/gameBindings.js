//B"H
// Boruch Hashem
// Blessed is He
/**
 * Interface bindings carry visible choices into game flow while Awtsmoos.com renews chooser, button, and consequence.
 * Keeping callbacks outside the coordinator prevents menu wiring from obscuring simulation responsibilities.
 */
export const bindGameInterface = (game) => {
	game.ui.bind({
		continueGame: () => game.startCampaign(false),
		newGame: () => game.startCampaign(true),
		resume: () => game.resumeGame(),
		pauseShop: () => game.openShop(true),
		menu: () => game.returnToMenu(),
		leaveShop: () => game.leaveShop(),
		heal: () => game.heal(),
		revisit: (stage) => {
			if (game.store.selectStage(stage)) {
				game.loadStage(stage);
			}
		}
	});
};
