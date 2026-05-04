
/**
 * B"H
 * @module mainMenuIndex
 * @description
 * In the beginning, there was only the Awtsmoos, the boundless Essence, 
 * devoid of definition, beyond all comprehension.
 */
import animations from "./animations.js";
import titleBuilder from "./titleBuilder.js";
import playButton from "./playButton.js";
import aliasButton from "./aliasButton.js";
import fileButton from "./fileButton.js";
import loginBtn from "../loginBtn.js";
import musicLayers from "../musicLayers.js";
import loading from "../loading.js";
import customWorldScreen from "../customWorldScreen.js";
import findWorldsScreen from "../findWorldsScreen.js";
import errorScreen from "../errorScreen.js";
import uiGame from "../gameUI.js";

import levelSelectScreen from "../screens/levelSelect.js"; 

var gameUiHTML = {
    shaym: "gameID",
    className:"gameUi",
    children: [
        ...uiGame
    ]
};

// B"H: Expose Game UI for Auto-Loader safely
if (typeof window !== 'undefined') {
    window.awtsmoosGameUI = gameUiHTML;
}

export default[
    musicLayers,
    {
        tag: "link",
        rel:"stylesheet",
        href:'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap'
    },
    {
        tag: "link",
        rel:"stylesheet",
        href:'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;700&display=swap'
    },
    {
        shaym: "main menu",
        className: "menu",
        gameUiHTML,
        ready: animations.ready,
        children:[
            {
                className: "loginHeader",
                children: [
                    loginBtn
                ]
            },
            {
                className: "menu-vessel",
                children:[
                    titleBuilder(),
                    {
                        className: "menu-actions",
                        children: [
                            playButton(gameUiHTML),
                            aliasButton(),
                            fileButton()
                        ]
                    }
                ]
            }
        ]
    },
    loading,
    customWorldScreen,
    findWorldsScreen,
    errorScreen,
    levelSelectScreen
];
