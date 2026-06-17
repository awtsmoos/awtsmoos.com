// B"H
import { treeHarvestRuntime } from "./TreeHarvestRuntime.js";
import { rockHarvestRuntime } from "./RockHarvestRuntime.js";
export function resourceNodeRuntime(object = {}) { if (object.type === "tree") return treeHarvestRuntime(object); if (object.type === "rock") return rockHarvestRuntime(object); return { targetId:object.id, kind:"resource_node", table:[], preview:[], cooldownSeconds:30 }; }
export function resourceNodesRuntime(objects = []) { return objects.filter(o => ["tree","rock","resource_node"].includes(o.type)).map(resourceNodeRuntime); }
