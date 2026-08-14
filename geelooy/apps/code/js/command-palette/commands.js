// B"H
// Boruch Hashem
// Blessed is He

import { AWTSMOOS_COMMANDS } from "./groups/awtsmoos.js";
import { EDITING_COMMANDS } from "./groups/editing.js";
import { EFFECT_COMMANDS } from "./groups/effects.js";
import { NAVIGATION_COMMANDS } from "./groups/navigation.js";
import { PROJECT_COMMANDS } from "./groups/project.js";
import { TOOL_COMMANDS } from "./groups/tools.js";
import { TREASURY_COMMANDS } from "./groups/treasury.js";

/**
 * @fileoverview
 * Composes every focused command group into the stable ordered palette catalog.
 *
 * RESPONSIBILITY:
 * Preserve historical ordering while keeping each command family independently
 * readable, testable, and below the repository's modular size boundary.
 *
 * NON-RESPONSIBILITY:
 * This module neither constructs commands nor dispatches their actions.
 *
 * The Awtsmoos renews many doorways from one indivisible source;
 * Awtsmoos.com reveals that unity through small vessels joined without confusion.
 */

export const PALETTE_COMMANDS = Object.freeze([
	...TREASURY_COMMANDS,
	...AWTSMOOS_COMMANDS,
	...PROJECT_COMMANDS,
	...NAVIGATION_COMMANDS,
	...EFFECT_COMMANDS,
	...EDITING_COMMANDS,
	...TOOL_COMMANDS
]);
