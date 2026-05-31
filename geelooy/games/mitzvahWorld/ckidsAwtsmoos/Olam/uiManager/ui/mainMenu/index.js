// B"H
/**
 * @module mainMenuIndex
 * @description
 * Chapter 95: the fake village overlay is cut away. The menu now launches a
 * real 3D village level, while the level selector remains hidden until the
 * in-world NPC asks it to appear.
 */
import animations from "./animations.js?v=wide-platform-real-boot-chain-20260529-bh75";
import titleBuilder from "./titleBuilder.js?v=wide-platform-real-boot-chain-20260529-bh75";
import playButton from "./playButton.js?v=real-3d-village-20260530-bh95";
import loading from "../loading.js?v=wide-platform-real-boot-chain-20260529-bh75";
import errorScreen from "../errorScreen.js?v=wide-platform-real-boot-chain-20260529-bh75";
import uiGame from "../gameUI.js?v=wide-platform-real-boot-chain-20260529-bh75";
import levelSelectScreen from "../screens/levelSelect.js?v=real-3d-village-20260530-bh95";

const gameUiHTML = { shaym: "gameID", className: "gameUi", children: [...uiGame] };
if (typeof window !== "undefined") window.awtsmoosGameUI = gameUiHTML;

export default [
  { tag: "link", rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" },
  { shaym: "main menu", className: "menu", gameUiHTML, ready: animations.ready, children: [{ className: "menu-vessel desert-only", children: [titleBuilder(), { className: "menu-actions", children: [playButton(gameUiHTML)] }] }] },
  loading,
  errorScreen,
  levelSelectScreen
];
