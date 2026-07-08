// B"H
import { generateMountainCommands } from "./MountainGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateTreeCommands } from "./TreeGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { generateFenceCommands } from "./FenceGenerator.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function compileStartingZoneTerrain(zone = {}) { return [...generateMountainCommands(zone), ...generateTreeCommands(zone), ...generateFenceCommands(zone)]; }
