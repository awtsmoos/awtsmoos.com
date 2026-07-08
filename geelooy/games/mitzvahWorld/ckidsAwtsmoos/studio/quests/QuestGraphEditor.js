// B"H
import { createQuestNode } from "./QuestNodeEditor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createQuestReward } from "./QuestRewardEditor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function createQuestGraph(input = {}) { return { id:input.id || "quest", title:input.title || "Quest", nodes:(input.nodes || [createQuestNode()]), rewards:createQuestReward(input.rewards) }; }
export default { createQuestGraph };
