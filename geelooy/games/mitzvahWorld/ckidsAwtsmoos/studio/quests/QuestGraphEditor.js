// B"H
import { createQuestNode } from "./QuestNodeEditor.js";
import { createQuestReward } from "./QuestRewardEditor.js";
export function createQuestGraph(input = {}) { return { id:input.id || "quest", title:input.title || "Quest", nodes:(input.nodes || [createQuestNode()]), rewards:createQuestReward(input.rewards) }; }
export default { createQuestGraph };
