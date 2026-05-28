// B"H
/**
 * @module mainMenuIndex
 * @description Lean Desert-only menu. No alias browser, no file loader,
 * no login/custom-world screens. Only Desert World, loading, game UI, and
 * Desert level select are loaded.
 */
import animations from "./animations.js";
import titleBuilder from "./titleBuilder.js";
import playButton from "./playButton.js";
import loading from "../loading.js";
import errorScreen from "../errorScreen.js";
import uiGame from "../gameUI.js";
import levelSelectScreen from "../screens/levelSelect.js";

const gameUiHTML = {
    shaym: "gameID",
    className: "gameUi",
    children: [...uiGame]
};

if (typeof window !== "undefined") {
    window.awtsmoosGameUI = gameUiHTML;
}

export default [
    {
        tag: "link",
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap"
    },
    {
        shaym: "main menu",
        className: "menu",
        gameUiHTML,
        ready: animations.ready,
        children: [
            {
                className: "menu-vessel desert-only",
                children: [
                    titleBuilder(),
                    {
                        className: "menu-actions",
                        children: [playButton(gameUiHTML)]
                    }
                ]
            }
        ]
    },
    loading,
    errorScreen,
    levelSelectScreen
];
