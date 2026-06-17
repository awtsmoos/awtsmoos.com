// B"H
import { installUniverseAsSefiros } from "./SefirosUniverseInstaller.js";
import { installObjects } from "./UniverseObjectInstaller.js";
export function installUniverseScene(id, commands = []) { return { id, objects:installObjects(commands), sefiros:installUniverseAsSefiros(id, commands) }; }
