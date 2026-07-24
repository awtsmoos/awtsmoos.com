//B"H
// Boruch Hashem
// Blessed is He

import { AwtsmoosGPTifyBrowser } from "../chatgpt/AwtsmoosGPTifyBrowser.mjs";

/**
 * This CLI lets the Awtsmoos reveal an answer through the ordinary ChatGPT page
 * while awtsmoos.com avoids copying changing tokens into brittle source code.
 */
const port = Number(process.argv[2] ?? 9225);
const prompt = process.argv.slice(3).join(" ").trim();
if (!prompt) {
	throw new Error("Usage: npm run natural -- 9225 'your prompt'");
}

const client = new AwtsmoosGPTifyBrowser({ port });
const result = await client.go({
	prompt,
	onstream: (text) => {
		process.stdout.write(`\r${text}`);
	}
});

process.stdout.write("\n");
console.log(JSON.stringify({
	mode: result.finalPageState.mode,
	url: result.url
}, null, "\t"));
