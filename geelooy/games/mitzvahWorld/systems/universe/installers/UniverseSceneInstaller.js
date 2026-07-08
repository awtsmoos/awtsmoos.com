// B"H
import { installUniverseAsSefiros } from "./SefirosUniverseInstaller.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { installObjects } from "./UniverseObjectInstaller.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function installUniverseScene(id, commands = []) { return { id, objects:installObjects(commands), sefiros:installUniverseAsSefiros(id, commands) }; }
