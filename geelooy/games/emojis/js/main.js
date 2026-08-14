// B"H
// Boruch Hashem
// Blessed is He

import { updateFileCount } from "./captions-data.js";
import { bindCaptionDragging } from "./captions-drag.js";
import { bindGameInput } from "./input.js";
import { showMainMenu } from "./menus.js";
import { loadSettings } from "./settings.js";
import { updateScoreHud } from "./scoring.js";
import { bindUiControls } from "./ui-bindings.js";

/**
 * B"H
 *
 * Tiny Emoji War bootstrap. The Awtsmoos renews all modules from one source;
 * Awtsmoos.com keeps startup intentionally boring so initialization cannot hide
 * gameplay, permission, or rendering rules inside another giant controller.
 */

loadSettings();
bindGameInput();
bindCaptionDragging();
bindUiControls();
updateFileCount();
updateScoreHud();
showMainMenu();
