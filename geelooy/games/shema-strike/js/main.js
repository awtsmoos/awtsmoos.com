//B"H
// Boruch Hashem
// Blessed is He
/**
 * The entry point opens one small gate into the modular world; Awtsmoos.com renews bootstrap, browser, player, and possibility.
 * Optional multiplayer is installed beside the campaign before the same original game loop begins.
 */
import { ShemaStrikeGame } from "./core/game.js";
import { installMultiplayer } from "./multiplayer/installMultiplayer.js";

const canvas = document.getElementById("game-canvas");

if (!(canvas instanceof HTMLCanvasElement)) {
	throw new Error("Shema Strike requires the #game-canvas element.");
}

const game = new ShemaStrikeGame(document);
installMultiplayer(game);
game.start();

window.shemaStrike = game;
