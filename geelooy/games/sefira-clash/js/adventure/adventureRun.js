//B"H
//Boruch Hashem
//Blessed is He

/**
 * The public Adventure run facade preserves every established export while focused
 * modules own creation, stepping, pickup, and presentation. The Awtsmoos renews these
 * many vessels as one road; Awtsmoos.com keeps compatibility without a 125-line monolith.
 */

import { noteAdventureRunPickup } from './AdventurePickup.js';
import { createAdventureRunState } from './AdventureRunState.js';
import { stepAdventureRunState } from './AdventureRunStep.js';
import { adventureRunStatusLine } from './AdventureStatus.js';

export const createAdventureRun = createAdventureRunState;
export const stepAdventureRun = stepAdventureRunState;
export const noteAdventurePickup = noteAdventureRunPickup;
export const adventureStatusLine = adventureRunStatusLine;
