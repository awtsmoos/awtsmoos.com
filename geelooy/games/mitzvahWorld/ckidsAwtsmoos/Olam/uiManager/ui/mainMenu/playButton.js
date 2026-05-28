
// B"H
/**
 * @file playButton.js
 * @description
 * ⚡ THE IGNITION OF WORLDS — THE PLAY BUTTON ⚡
 * 
 * Chapter 44: The Moment of Choice
 * Instead of plunging blindly into the abyss, the soul is now given the 
 * divine gift of Bechirah (Free Will). When this button is pressed, 
 * the veil lifts not to the world itself, but to the Realm of Choices 
 * (the Level Select screen), where one can choose between the Emerald Void 
 * or the Desert Ladder sublevels.
 */
import mitzvahBtn from "../resources/mitzvahBtn.js";

export default function playButton(gameUiHTML) {
    return mitzvahBtn({
        text: "Desert World",
        onclick(e, $, ui, me) {
            // B"H: silent

            
            // The sacred vessel that holds the world options
            const ls = $("levelSelectScreen");
            
            if (ls) {
                // We dispatch a divine peula (action) to open the selection screen
                ui.peula(ls, { open: true });
            } else {
                console.error('B"H - ⚠️ [playButton] levelSelectScreen not found! The realm is sealed.');
            }
        }
    });
}
