//B"H
// Boruch Hashem
// Blessed is He
/**
 * The entry point opens one small gate into the modular world; Awtsmoos.com renews bootstrap, browser, player, and possibility.
 * All substantial responsibility remains in focused modules so startup stays transparent and recoverable.
 */
import { ShemaStrikeGame } from "./core/game.js";

const canvas = document.getElementById("game-canvas");

if (!(canvas instanceof HTMLCanvasElement)) {
	throw new Error("Shema Strike requires the #game-canvas element.");
}

const game = new ShemaStrikeGame(canvas);
game.start();

window.shemaStrike = game;
