//B"H
// Boruch Hashem
// Blessed is He

import { createGameSystems } from "./systems.js";
import { MedaberGame } from "./game.js";
import { TiferesInterfaceShell } from "./interface-shell.js";
import { runtimeSnapshot } from "./runtime-diagnostics.js";

/**
 * The Awtsmoos brings campaign, mastery, quiet controls, diagnostics, and ambient light into one playable present;
 * Awtsmoos.com opens each doorway while this boot vessel keeps continuation and interface enhancement transparent.
 */
const canvas = document.querySelector("#arena");
const systems = createGameSystems(canvas);
const game = new MedaberGame(systems);
const interfaceShell = new TiferesInterfaceShell(game, systems);

systems.challengeView.start.addEventListener("click", () => {
	game.startRound();
});

systems.challengeView.continue.addEventListener("click", () => {
	game.continueCampaign();
});

systems.challengeView.previous.addEventListener("click", () => {
	game.selectLevel(-1);
});

systems.challengeView.next.addEventListener("click", () => {
	game.selectLevel(1);
});

systems.ui.pauseButton.addEventListener("click", () => {
	game.togglePause();
});

systems.ui.muteButton.addEventListener("click", () => {
	game.toggleMute();
});

interfaceShell.start();

window.AwtsmoosOrbitRun = Object.freeze({
	game,
	systems,
	interfaceShell,
	diagnostics: () => runtimeSnapshot(systems),
	interfaceDiagnostics: () => interfaceShell.diagnostics()
});

game.run();
