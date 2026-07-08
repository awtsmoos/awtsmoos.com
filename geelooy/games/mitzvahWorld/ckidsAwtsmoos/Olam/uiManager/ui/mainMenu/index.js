// B"H
/** @module mainMenuIndex @description Menu summons the fresh verified UI chain. */
import animations from "./animations.js?compact=true&v=ray-ground-ui-20260602-bh128";
import titleBuilder from "./titleBuilder.js?compact=true&v=ray-ground-ui-20260602-bh128";
import playButton, { studioMenuButton, movieMakerMenuButton } from "./playButton.js?compact=true&v=world-studio-movie-maker-20260706-bh1";
import loading from "../loading.js?compact=true&v=multi-progress-texture-cache-20260614-bh1";
import errorScreen from "../errorScreen.js?compact=true&v=ray-ground-ui-20260602-bh128";
import uiGame from "../gameUI.js?compact=true&v=solid-browser-verify-20260702-bh8";
import levelSelectScreen from "../screens/levelSelect.js?compact=true&v=ray-ground-ui-20260602-bh128";

const gameUiHTML = { shaym:"gameID", className:"gameUi", children:[...uiGame] };
if (typeof window !== "undefined") window.awtsmoosGameUI = gameUiHTML;

export default [
  { tag:"link", rel:"stylesheet", href:"https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" },
  { shaym:"main menu", className:"menu", gameUiHTML, ready:animations.ready, children:[{ className:"menu-vessel desert-only", children:[titleBuilder(), { className:"menu-actions", children:[playButton(gameUiHTML), studioMenuButton(), movieMakerMenuButton()] }] }] },
  loading,
  errorScreen,
  levelSelectScreen
];
