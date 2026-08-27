// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BotanicalFlowerParts.js
 * @description Composes visible crowns with explicit protective and reproductive organs.
 */

import { appendBotanicalFlowerCrown } from "./BotanicalFlowerCrownParts.js";
import {
	appendBotanicalFlowerOrgans,
	appendBotanicalStem
} from "./BotanicalFlowerCoreParts.js";

/** Builds a recognizable flower without multiplying material batches. */
export function appendFlowerForm(buffers, context) {
	appendBotanicalStem(buffers.green, context);
	appendBotanicalFlowerCrown(buffers, context);
	appendBotanicalFlowerOrgans(buffers, context);
}
