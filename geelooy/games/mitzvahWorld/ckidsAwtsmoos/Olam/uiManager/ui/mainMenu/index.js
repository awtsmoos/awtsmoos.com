// B"H
/**
 * @module mainMenuIndex
 * @description Chapter 75: The menu imports the refreshed UI vessel explicitly.
 * The Awtsmoos ensures the menu-held gameUiHTML and the autoload dispatch both
 * belong to the same worker/platform-size boot chain.
 */
import animations from "./animations.js?v=wide-platform-real-boot-chain-20260529-bh75";
import titleBuilder from "./titleBuilder.js?v=wide-platform-real-boot-chain-20260529-bh75";
import playButton from "./playButton.js?v=wide-platform-real-boot-chain-20260529-bh75";
import loading from "../loading.js?v=wide-platform-real-boot-chain-20260529-bh75";
import errorScreen from "../errorScreen.js?v=wide-platform-real-boot-chain-20260529-bh75";
import uiGame from "../gameUI.js?v=wide-platform-real-boot-chain-20260529-bh75";
import levelSelectScreen from "../screens/levelSelect.js?v=wide-platform-real-boot-chain-20260529-bh75";

const gameUiHTML = { shaym: "gameID", className: "gameUi", children: [...uiGame] };
if (typeof window !== "undefined") window.awtsmoosGameUI = gameUiHTML;

export default [
  { tag: "link", rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" },
  { shaym: "main menu", className: "menu", gameUiHTML, ready: animations.ready, children: [{ className: "menu-vessel desert-only", children: [titleBuilder(), { className: "menu-actions", children: [playButton(gameUiHTML)] }] }] },
  loading,
  errorScreen,
  levelSelectScreen
];
