// B"H
/** @file NpcDialogueModel.js @description Dialogue personalities change with purified regions and occupations. */
export function npcDialogue(role = "villager", mood = "hopeful") { return { greeting:`Shalom, I am a ${role}.`, mood, topics:["weather","mitzvah","village-news"], purifiedLine:"The air feels clearer today.", questLine:role === "teacher" ? "Can you bring books to the study hall?" : "Can you help our village?" }; }
export default npcDialogue;
