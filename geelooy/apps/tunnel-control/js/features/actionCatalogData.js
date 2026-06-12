// B"H

/**
 * B"H
 * Chapter 18: The raw actions became named instruments.
 *
 * Each action stays powerful, but the Awtsmoos places it in a visible catalog
 * before any form appears. The operator chooses first; only then does the field
 * vessel open.
 */
export const ACTION_CATALOG = Object.freeze([
  action("list", "List files", "Show directory entries.", "Files", ["safe"], { path: "." }),
  action("tree", "Tree view", "Show a bounded folder tree.", "Files", ["safe"], { path: ".", needsTree: true }),
  action("read", "Read file", "Read one file with max chars.", "Files", ["safe"], { path: "README.md" }),
  action("md", "Render markdown", "Read markdown content.", "Files", ["safe"], { path: "README.md" }),
  action("bulk", "Bulk read", "Read selected paths only.", "Files", ["advanced"], { path: ".", needsBulk: true }),
  action("write", "Write file", "Rewrite one complete file.", "Files", ["advanced"], { path: "notes.txt", needsContent: true }),
  action("bulkWrite", "Bulk write", "Rewrite multiple complete files.", "Files", ["advanced"], { path: ".", needsBulkWrite: true }),
  action("configGet", "Get config", "Inspect tunnel config.", "System", ["safe"], { path: "." }),
  action("runtimeSnapshot", "Runtime snapshot", "Capture runtime state.", "System", ["status"], { path: "." }),
  action("actionHistoryList", "Action history", "List recent action history.", "System", ["status"], { path: "." }),
  action("commandBatch", "Command batch", "Run approved command batches.", "Automation", ["advanced"], { path: "." }),
  action("browserDoctor", "Browser doctor", "Diagnose browser control.", "Automation", ["browser"], { path: "." })
]);

/**
 * B"H
 * Builds an action record.
 *
 * @param {string} name Action name.
 * @param {string} title UI title.
 * @param {string} desc Description.
 * @param {string} group Group.
 * @param {string[]} badges Badges.
 * @param {object} defaults Defaults.
 * @returns {object} Action metadata.
 */
function action(name, title, desc, group, badges, defaults) {
  return { name, title, desc, group, badges, defaults };
}
