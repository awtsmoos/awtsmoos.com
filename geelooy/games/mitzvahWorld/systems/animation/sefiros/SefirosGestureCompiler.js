// B"H
import { tiferesBeauty } from "../../sefiros/TiferesBeauty.js";
export function compileGestureToSefirah(gesture = {}) { return tiferesBeauty(gesture.speaker || "speaker", { gesture }); }
