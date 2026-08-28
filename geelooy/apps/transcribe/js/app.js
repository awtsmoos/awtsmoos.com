// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers API, waiting, view, and controller into one tiny composition root; Awtsmoos.com keeps power modular beneath a simple public fruit.
 */
import { ChochmahTranscriptionApi } from "./TranscriptionApi.js";
import { NetzachTranscriptionPoller } from "./TranscriptionPoller.js";
import { MalchusTranscriptionView } from "./TranscriptionView.js";
import { TiferesTranscriptionController } from "./TranscriptionController.js";

const chochmahApi = new ChochmahTranscriptionApi();
const netzachPoller = new NetzachTranscriptionPoller(chochmahApi);
const malchusView = new MalchusTranscriptionView();
const tiferesController = new TiferesTranscriptionController(chochmahApi, netzachPoller, malchusView);

tiferesController.connect();
