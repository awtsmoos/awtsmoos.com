// B"H
// Daily questions: tiny openings in the wall of habit.
export const prompts = ["What tiny act can become a gate today?","Which person needs a hidden kindness?","What word can be guarded before it escapes?","Where can joy be planted without noise?","What old spark deserves mercy instead of shame?","Which mitzvah can be made beautiful, not merely done?","What would make this hachlatah easier to keep tomorrow?"];
export const dayPrompt = (time = Date.now()) => prompts[Math.floor(time / 86400000) % prompts.length];
