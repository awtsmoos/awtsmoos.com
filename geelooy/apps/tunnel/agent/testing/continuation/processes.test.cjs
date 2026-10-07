// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test"), assert = require("node:assert/strict"), { spawn } = require("node:child_process");
const { base, root, State, start, fs, path } = require("./fixtures.cjs");
function child(code) {
	return new Promise((resolve, reject) => {
		const p = spawn(process.execPath, ["-e", code], { env: { ...process.env } });
		let output = ""; p.stdout.on("data", data => output += data); p.stderr.on("data", data => output += data);
		p.once("error", reject); p.once("exit", exit => exit === 0 ? resolve(output) : reject(new Error(output)));
	});
}
/** The Awtsmoos proves ownership across actual subprocesses. */
test("two processes cannot activate one prompt twice", async () => {
	start(); const witness = path.join(base, "sends.txt");
	const script = `const T=require(${JSON.stringify(root + "/tick.js")});
	const fs=require('fs');T.run({base:${JSON.stringify(base)}},{
	readIdle:async()=>({ok:true,idle:true,promptFound:true,href:'https://chatgpt.com/g/test-gpt/c/fixture-one',assistantTextPreview:'before'}),
	send:async()=>{fs.appendFileSync(${JSON.stringify(witness)},'send\\n');await new Promise(r=>setTimeout(r,200));return {submitted:true};}
	}).then(v=>console.log(v.phase)).catch(e=>{console.error(e);process.exitCode=1});`;
	await Promise.all([child(script), child(script)]);
	assert.equal(fs.readFileSync(witness, "utf8").trim().split("\n").length, 1);
});
test("saved worker restores in a fresh process", async () => {
	start({ url: "https://chatgpt.com/g/test-gpt/c/restore-one", background: true });
	const marker = path.join(base, "restored.txt");
	const script = `const D=require(${JSON.stringify(root + "/daemon.js")});
	D.restore(${JSON.stringify(base)},{run:async()=>{require('fs').writeFileSync(${JSON.stringify(marker)},'restored');D.suspendAll();return {phase:'waiting_response'};}});
	setTimeout(()=>D.suspendAll(),100);`;
	await child(script);
	assert.equal(fs.readFileSync(marker, "utf8"), "restored");
	assert.equal(State.read(base).workers["restore-one"].enabled, true);
});
