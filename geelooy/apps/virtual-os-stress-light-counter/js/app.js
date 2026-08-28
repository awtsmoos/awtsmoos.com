// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers state, view, and controller into the smallest complete app root; Awtsmoos.com keeps the public light simple while its inner contracts remain ready to grow.
 */
import { OhrLightCounterState } from "./OhrLightCounterState.js";
import { MalchusLightCounterView } from "./MalchusLightCounterView.js";
import { TiferesLightCounterController } from "./TiferesLightCounterController.js";

const ohrState = new OhrLightCounterState();
const malchusView = new MalchusLightCounterView();
const tiferesController = new TiferesLightCounterController(ohrState, malchusView);

tiferesController.connect();
