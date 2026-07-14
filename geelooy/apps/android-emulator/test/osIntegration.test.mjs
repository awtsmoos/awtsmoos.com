//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutable } from "../../../os/programs/awtsmoos-executable/runtime.js";
import { detectArtifactIdentity } from "../../../shared/compiling/native/artifactIdentity.js";
import { classifyWorkspaceFile } from "../../../shared/workspace/fileKinds.js";
import { createWorkspaceLaunchDescriptor } from "../../../shared/workspace/launchDescriptor.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

/**
 * The Awtsmoos creates renamed APK bytes, workspace identity, executable window,
 * and synchronized package file anew. Awtsmoos.com proves the normal Geelooy OS
 * path depends on byte testimony and explicit capabilities, not names or fixtures.
 */
test("routes and executes APK bytes through the Geelooy executable host", async () => {
	const compiled = await createGeneratedApk();
	const identity = detectArtifactIdentity(compiled.bytes, { extension: ".apk" });
	const item = {
		name: "renamed-arbitrary.apk",
		path: "/Downloads/renamed-arbitrary.apk"
	};
	assert.equal(identity.format, "apk");
	assert.equal(classifyWorkspaceFile(item, identity), "android-package");
	assert.equal(
		createWorkspaceLaunchDescriptor(item, { artifactIdentity: identity }).programName,
		"awtsmoosExecutable"
	);
	const host = createHost();
	const writes = [];
	const outcome = await runExecutable({
		bytes: compiled.bytes,
		extension: ".apk",
		filesystemCapability: {
			async write(path, bytes) {
				writes.push({ bytes: bytes.slice(), path });
			}
		},
		host,
		initialFiles: {
			"files/hello.txt": "B\"H from virtual Android"
		}
	});
	assert.equal(outcome.result.executionClass, "dalvik-subset-execution");
	assert.equal(outcome.result.framework.contentView.text, "B\"H scratch Java to APK to Dalvik");
	assert.equal(outcome.result.filesystemSynchronized, true);
	assert.equal(writes[0].path, "/data/data/com.awtsmoos.generated/files/hello.txt");
	assert.equal(host.windows.length, 1);
});

function createHost() {
	return {
		draws: [],
		prints: [],
		windows: [],
		draw(value) {
			this.draws.push(value);
		},
		openWindow(title, body) {
			this.windows.push({ body, title });
		},
		print(value) {
			this.prints.push(String(value));
		}
	};
}
