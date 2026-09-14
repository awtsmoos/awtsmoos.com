//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { CloudDraftService } from "../services/cloudDraftService.js";

/** Proves local source can graduate into a private account-backed Cloud project without publication. */
function harness(files = sourceFiles()) {
	const writes = [];
	const service = new CloudDraftService({
		state: {
			snapshot: () => ({
				currentRoute: "browser-local",
				currentPath: "remix-demo",
				transportMode: "browser"
			})
		},
		client: {
			async write(aliasId, path, content) {
				writes.push({ aliasId, path, content });
				return { entry: { path } };
			}
		},
		bundleService: { async build() { return { files }; } }
	});
	return { service, writes };
}

function sourceFiles() {
	return [
		{ path: "index.html", content: "<h1>B H</h1>" },
		{ path: "src/app.js", content: "//B H" },
		{ path: ".awtsmoos-remix-origin.json", content: "{}" }
	];
}

test("private Cloud copy preserves source and writes completion marker last", async () => {
	const subject = harness();
	const result = await subject.service.save({ aliasId: "alpha", projectId: "Remix Demo" });
	assert.match(result.rootPath, /^projects\/remix-demo-[a-z0-9]{1,10}$/);
	assert.equal(subject.writes.length, 4);
	assert.deepEqual(subject.writes.slice(0, 3).map(write => write.path.replace(`${result.rootPath}/`, "")), [
		"index.html",
		"src/app.js",
		".awtsmoos-remix-origin.json"
	]);
	const marker = subject.writes.at(-1);
	assert.equal(marker.path, `${result.rootPath}/.awtsmoos-cloud-project.json`);
	assert.equal(JSON.parse(marker.content).kind, "awtsmoos-cloud-project-v1");
});

test("missing index fails before any private Cloud write", async () => {
	const subject = harness([{ path: "app.js", content: "//B H" }]);
	await assert.rejects(
		subject.service.save({ aliasId: "alpha", projectId: "demo" }),
		error => error.code === "CLOUD_INDEX_REQUIRED"
	);
	assert.equal(subject.writes.length, 0);
});

test("missing alias fails before bundle materialization", async () => {
	const subject = harness();
	let built = false;
	subject.service.bundleService = { async build() { built = true; return { files: sourceFiles() }; } };
	await assert.rejects(subject.service.save({ projectId: "demo" }), error => error.code === "CLOUD_ALIAS_REQUIRED");
	assert.equal(built, false);
});
