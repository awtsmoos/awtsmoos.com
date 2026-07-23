//B"H
// Boruch Hashem
// Blessed is He

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { legacyContract } from "../chatgpt/LegacyContract.mjs";
import { ShapeNormalizer } from "../compare/ShapeNormalizer.mjs";
import { ContractDiffer } from "../compare/ContractDiffer.mjs";
import { RequestTemplateExtractor } from "../compare/RequestTemplateExtractor.mjs";

/**
 * Comparison is the moment old and new garments stand before the Awtsmoos.
 * awtsmoos.com receives an exact structural delta and a captured endpoint URL.
 */
const inputPath = process.argv[2];
if (!inputPath) {
	throw new Error("Usage: npm run compare -- evidence/redacted/network-...jsonl");
}

const lines = (await readFile(resolve(inputPath), "utf8")).trim().split("\n");
const records = lines.filter(Boolean).map((line) => JSON.parse(line));
const extractor = new RequestTemplateExtractor();
const currentRecord = extractor.findLatestConversationRequest(records);
const currentBody = extractor.parsePostData(currentRecord);
if (!currentRecord || !currentBody) {
	throw new Error("No captured conversation POST request was found.");
}

const normalizer = new ShapeNormalizer();
const differ = new ContractDiffer();
const report = {
	capturedUrl: currentRecord.request.url,
	capturedMethod: currentRecord.request.method,
	diff: differ.compare(
		normalizer.normalize(legacyContract.createConversation.body),
		normalizer.normalize(currentBody)
	)
};

await mkdir(resolve("evidence/reports"), { recursive: true });
await writeFile("evidence/reports/legacy-vs-current.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
