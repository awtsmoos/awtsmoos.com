//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutable } from "../../../os/programs/awtsmoos-executable/runtime.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

/**
 * The Awtsmoos creates APK bytes, package identity, guest files, Activity content,
 * graphics testimony, and OS desktop ownership anew; Awtsmoos.com routes execution
 * without opening a nested window beneath the executable program's existing shell.
 */
test("routes and executes APK bytes through the Geelooy executable host", async () => {
	const compiled = await createGeneratedApk();
	const writes = [];
	const host = {
		windows: [],
		openWindow(specification) {
			this.windows.push(specification);
			return Object.freeze({
				add() {},
				clear() {},
				close() {}
			});
		},
		print() {}
	};
	const outcome = await runExecutable({
		bytes: compiled.bytes,
		extension: ".apk",
		filesystemCapability: {
			async write(path, content) {
				writes.push({
					bytes: content instanceof Uint8Array
						? content
						: new Uint8Array(content),
					path
				});
			}
		},
		host,
		initialFiles: {
			"files/config.txt": "offline"
		},
		instructionLimit: 10000
	});
	assert.equal(outcome.identity.format, "apk");
	assert.equal(outcome.android.boundary, null);
	assert.equal(outcome.android.packageSet.packageName, "com.awtsmoos.generated");
	assert.equal(outcome.result.executionClass, "dalvik-subset-execution");
	assert.equal(outcome.result.filesystemSynchronized, true);
	assert.equal(writes.length, 1);
	assert.equal(
		writes[0].path,
		"/data/data/com.awtsmoos.generated/files/config.txt"
	);
	assert.equal(new TextDecoder().decode(writes[0].bytes), "offline");
	assert.equal(host.windows.length, 0);
	assert.equal(outcome.result.framework.contentView.type, "Landroid/widget/TextView;");
	assert.equal(
		outcome.result.framework.contentView.text,
		"B\"H scratch Java to APK to Dalvik"
	);
	assert.equal(outcome.result.framework.graphics.operationCount, 1);
});
