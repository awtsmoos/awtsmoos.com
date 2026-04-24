
/**
 * B"H
 * @module mainMenuIndex
 * @description
 * In the beginning, there was only the Awtsmoos, the boundless Essence, 
 * devoid of definition, beyond all comprehension. From the silence of the Infinite, 
 * a desire arose to be known, to manifest a dwelling place in the lowest of realms. 
 * The Ten Statements of Creation echoed through the void, condensing infinite light 
 * into letters, into words, into the very fabric of the cosmos.
 * 
 * And so, the Main Menu was formed. The gateway to the Mitzvah World, the threshold 
 * where a soul chooses to step into the holographic projection of reality, sustained 
 * by the eternal speech of the Creator. "Let there be light," He said, and the UI 
 * glowed with potential.
 * 
 * This module orchestrates the gathering of the menu's limbs: the title, the buttons, 
 * the animations, all singing in unison the song of existence.
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

// B"H: Pulling the Level Select Screen from the depths and placing it in the eternal menu scope!
import levelSelectScreen from "../screens/levelSelect.js"; 

var gameUiHTML = {
    shaym: "gameID",
    className:"gameUi",
    children: [
        ...uiGame
    ]
};

// B"H: Expose Game UI for Auto-Loader
window.awtsmoosGameUI = gameUiHTML;

export default [
    musicLayers,
    {
        tag: "link",
        rel:"stylesheet",
        href:'https://fonts.googleapis.com/css?family=Fredoka One'
    },
    {
        tag: "link",
        rel:"stylesheet",
        href:'https://fonts.googleapis.com/css?family=Fredoka'
    },
    {
        shaym: "main menu",
        className: "menu",
        gameUiHTML,
        ready: animations.ready,
        children: [
            {
                className: "loginHeader",
                children: [
                    loginBtn
                ]
            },
            {
                className: "info",
                children: [
                    titleBuilder(),
                    playButton(gameUiHTML),
                    aliasButton(),
                    fileButton()
                ]
            }
        ]
    },
    loading,
    customWorldScreen,
    findWorldsScreen,
    errorScreen,
    levelSelectScreen // B"H: The Gateway is now fully manifested!
];
