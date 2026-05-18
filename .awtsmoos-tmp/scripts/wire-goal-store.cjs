// B"H
const fs = require("fs");
const file = "vibe/runtime/reality/SelfHealLoop.js";
let text = fs.readFileSync(file, "utf8");
const edits = [
  [
    "import { GoalEntity } from './GoalEntity.js';",
    "import { GoalEntity } from './GoalEntity.js';\nimport { GoalStore } from './GoalStore.js';"
  ],
  [
    "return {\n            ok: score.ok,",
    "const storedGoal = GoalStore.save(goal.toJSON());\n\n        return {\n            ok: score.ok,"
  ],
  [
    "goal: goal.toJSON(),",
    "goal: storedGoal,"
  ]
];
for (const [from, to] of edits) {
  if (!text.includes(from)) throw new Error("Pattern not found: " + from);
  text = text.replace(from, to);
}
fs.writeFileSync(file, text);
console.log("wired goal store");
