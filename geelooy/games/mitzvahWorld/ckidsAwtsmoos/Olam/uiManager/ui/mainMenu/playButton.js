
// B"H
/**
 * @file playButton.js
 * @description
 * ⚡ THE IGNITION OF WORLDS — THE PLAY BUTTON ⚡
 */
import mitzvahBtn from "../resources/mitzvahBtn.js";
import { MINIMAL_GRASS_WORLD } from "../../../../../levelData.js";

export default function playButton(gameUiHTML) {
    return mitzvahBtn({
        text: "Play",
        onclick(e, $, ui, me) {
            const ikar = $("ikar");
            const loadingScreen = $("loading");
            const menuScreen = $("main menu");

            if (!ikar) {
                console.error('B"H - ⚠️ [playButton] ikar element not found! Cannot dispatch start event.');
                return;
            }

            console.log('B"H - ⚡ [playButton] Click! Dispatching world start for:', MINIMAL_GRASS_WORLD.shaym);

            if (menuScreen) {
                menuScreen.classList.add("hidden");
                menuScreen.isGoing = false;
            }

            // B"H: Reveal the Loading Screen visibly!
            if (loadingScreen) {
                loadingScreen.classList.remove("hidden");
                loadingScreen.style.display = "flex";
                loadingScreen.style.opacity = "1";
            }

            ikar.dispatchEvent(new CustomEvent("start", {
                detail: { worldDayuh: MINIMAL_GRASS_WORLD, gameUiHTML }
            }));
        }
    });
}
