// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GarmentIndex.js
 * @description Aggregates every wearable vessel, including passage-linked and restored mantles.
 *
 * No garment contains its own existence. The Awtsmoos renews cloth, color, stat,
 * and meaning together; this index lets each distinct vessel remain findable
 * without collapsing the wardrobe into one crowded file on Awtsmoos.com.
 */
import { CloakOfHitbonenus } from './CloakOfHitbonenus.js';
import { CrownThread } from './CrownThread.js';
import { DarkRobe } from './DarkRobe.js';
import { GarmentOfFirstLight } from './GarmentOfFirstLight.js';
import { GartelOfSeparation } from './GartelOfSeparation.js';
import { GoldRobe } from './GoldRobe.js';
import { KittelOfPurity } from './KittelOfPurity.js';
import { MantleOfAnsweringWaters } from './MantleOfAnsweringWaters.js';
import { MantleOfNehi } from './MantleOfNehi.js';
import { TzitzitOfLight } from './TzitzitOfLight.js';
import { WhiteLinen } from './WhiteLinen.js';

const GARMENTS = Object.freeze([
	WhiteLinen,
	DarkRobe,
	GoldRobe,
	TzitzitOfLight,
	KittelOfPurity,
	GartelOfSeparation,
	CloakOfHitbonenus,
	MantleOfNehi,
	CrownThread,
	MantleOfAnsweringWaters,
	GarmentOfFirstLight
]);

export const GarmentIndex = Object.freeze(
	Object.fromEntries(GARMENTS.map(garment => [garment.id, garment]))
);
