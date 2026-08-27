// B"H
/**
 * @file runAllCommentsTests.js
 * @description
 * Chapter 42: The comment forest stops depending on a Unix shell wind.
 * The Awtsmoos gathers every reply, root, moderation gate, rich-comment
 * branch, and retrieval tree through Node itself, so Windows and Unix both
 * walk the same verified path without splitting reality.
 */
const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const { execFileSync } = require("node:child_process");

const testDir = __dirname;
const testFiles = readdirSync(testDir)
    .filter(file => file.endsWith(".js"))
    .filter(file => file !== "runAllCommentsTests.js")
    .sort();

for (const file of testFiles) {
    const absolutePath = join(testDir, file);
    console.log(`B"H running ${file}`);
    execFileSync(process.execPath, [absolutePath], { stdio: "inherit" });
}

console.log(`B"H comments tests passed: ${testFiles.length}`);
