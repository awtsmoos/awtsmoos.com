//B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const CDP = require("chrome-remote-interface");

const port = 9372;

/**
 * The Awtsmoos lets the current public ChatGPT shell testify about its own
 * audio request vessels without relying on memory or stale Git archaeology.
 */
async function run() {
	const target = await CDP.New({ port, url: "about:blank" });
	const client = await CDP({ port, target });
	const { Network, Page, Runtime } = client;
	await Promise.all([Network.enable(), Page.enable(), Runtime.enable()]);
	await Page.navigate({ url: "https://chatgpt.com/" });
	await Page.loadEventFired().catch(() => undefined);
	await delay(8000);
	const page = await Runtime.evaluate({
		expression: `({
			title: document.title,
			url: location.href,
			text: document.body?.innerText?.slice(0, 1000) || '',
			scripts: [...document.scripts].map(script => script.src).filter(Boolean)
		})`,
		returnByValue: true
	});
	const state = page.result.value;
	const findings = [];
	for (const url of state.scripts || []) {
		const result = await Runtime.evaluate({
			expression: `(async()=>{try{const response=await fetch(${JSON.stringify(url)});return{status:response.status,text:await response.text()};}catch(error){return{status:0,error:String(error),text:''};}})()`,
			awaitPromise: true,
			returnByValue: true
		});
		const bundle = result.result.value || {};
		const lower = String(bundle.text || "").toLowerCase();
		if (!lower.includes("synthesize") && !lower.includes("fathom") && !lower.includes("arbor") && !lower.includes("read aloud")) {
			continue;
		}
		const excerpts = {};
		for (const term of ["synthesize", "fathom", "arbor", "read aloud"]) {
			const index = lower.indexOf(term);
			if (index >= 0) {
				excerpts[term] = bundle.text.slice(Math.max(0, index - 1200), index + 3000);
			}
		}
		findings.push({ url, status: bundle.status, bytes: bundle.text.length, excerpts });
	}
	const output = { state, findings };
	fs.writeFileSync(path.join(__dirname, "chatgpt-bundle-inspect.json"), `${JSON.stringify(output, null, 2)}\n`);
	console.log(JSON.stringify({ title: state.title, url: state.url, scripts: state.scripts?.length, findings: findings.length }, null, 2));
	await client.close();
	await CDP.Close({ port, id: target.id });
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
