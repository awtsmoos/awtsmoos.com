// B"H
const assert = require("node:assert/strict");
const { likelyLongRunning } = require("./commandModePolicy.js");
const { shouldRunSync } = require("./commandActionSync.js");

for (const command of ["pwd", "whoami", "uname -a", "git status --short", "git rev-parse HEAD", "git diff --stat", "ls", "cat package.json", "node --version", "echo hi"]) {
	assert.equal(shouldRunSync({ command }), true, command);
}
for (const command of ["npm test", "npm run build", "npx eslint .", "pnpm install", "git clone https://example.com/repo.git", "git fetch origin", "tail -f server.log", "grep -R needle src"]) {
	assert.equal(likelyLongRunning(command), true, command);
	assert.equal(shouldRunSync({ command }), false, command);
	assert.equal(shouldRunSync({ command, sync: true }), true, `explicit sync ${command}`);
}
assert.equal(likelyLongRunning("echo npm test"), false);
assert.equal(shouldRunSync({ command: "pwd", async: true }), false);
assert.equal(shouldRunSync({ command: "pwd", timeoutMs: 60000 }), false);
console.log(JSON.stringify({ok:true, suite:"native-command-auto-mode-policy"}));
