// B"H
/** @module mainMenuIndex @description Menu summons fresh UI chain with every worker UI root. */
import animations from "./animations.js?v=ray-ground-ui-20260602-bh128";
import titleBuilder from "./titleBuilder.js?v=ray-ground-ui-20260602-bh128";
import playButton from "./playButton.js?v=ray-ground-ui-20260602-bh128";
import loading from "../loading.js?v=multi-progress-texture-cache-20260614-bh1";
import errorScreen from "../errorScreen.js?v=ray-ground-ui-20260602-bh128";
import uiGame from "../gameUI.js?v=player-probe-copy-20260701-bh1";
import levelSelectScreen from "../screens/levelSelect.js?v=ray-ground-ui-20260602-bh128";
const gameUiHTML = { shaym:"gameID", className:"gameUi", children:[...uiGame] };
if (typeof window !== "undefined") window.awtsmoosGameUI = gameUiHTML;
export default [
  { tag:"link", rel:"stylesheet", href:"https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" },
  { shaym:"main menu", className:"menu", gameUiHTML, ready:animations.ready, children:[{ className:"menu-vessel desert-only", children:[titleBuilder(), { className:"menu-actions", children:[playButton(gameUiHTML)] }] }] },
  loading,
  errorScreen,
  levelSelectScreen
];





