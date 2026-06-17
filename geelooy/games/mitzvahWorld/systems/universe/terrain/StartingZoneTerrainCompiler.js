// B"H
import { generateMountainCommands } from "./MountainGenerator.js";
import { generateTreeCommands } from "./TreeGenerator.js";
import { generateFenceCommands } from "./FenceGenerator.js";
export function compileStartingZoneTerrain(zone = {}) { return [...generateMountainCommands(zone), ...generateTreeCommands(zone), ...generateFenceCommands(zone)]; }
