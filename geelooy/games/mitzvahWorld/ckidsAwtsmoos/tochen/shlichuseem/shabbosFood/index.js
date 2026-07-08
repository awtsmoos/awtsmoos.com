
/**
 * B"H
 * Shabbos Food Quest
 */
import dialogue from "./dialogue.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import tasks from "./tasks.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

var id = 4;
var totalItems = 7;

export default {
    id,
    type: "single",
    shaym: "Elevation of Elements",
    requires: { started: [ 1 ] },
    objective: "Go out to the wheat field and get some wheat for Challah baking, then bring it back.",
    tasks,
    completeText: "Mazel Tov! You have collected all of the items. Now go to the gate.",
    dialogue,
    returnTo: { nivra: "receiver" },
    totalCollectedObjects: totalItems,
    collected: 0,
    progressDescription: "Items Collected",
    collectableItems: { type: "Wheat", entityName: "wheat" },
    timeLimit: { minutes: 3, seconds: 0 },
    returnTimeLimit: { minutes: 1, seconds: 30 }
};
