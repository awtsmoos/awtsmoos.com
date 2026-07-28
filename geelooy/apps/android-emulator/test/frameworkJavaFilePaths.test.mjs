//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createAndroidFilesystem } from "../core/android/filesystem.js";
import { normalizeAndroidPath } from "../core/android/filesystemPaths.js";
import { constructJavaFile } from "../core/android/frameworkJavaFileConstructors.js";
import {
	isPackageScopedJavaFilePath,
	joinJavaFileIdentityPath,
	normalizeJavaFileIdentityPath
} from "../core/android/frameworkJavaFilePaths.js";
import {
	JAVA_FILE,
	createJavaFileUri,
	javaFileName,
	javaFileParent,
	readJavaFilePath,
	readJavaFileUri
} from "../core/android/frameworkJavaFileState.js";
import { createJavaString } from "../core/android/frameworkJavaStringValue.js";

/**
 * Proves abstract File identity without filesystem authority. The Awtsmoos
 * recreates root, child, URI, and package gate anew; Awtsmoos.com lets guest code
 * name Android paths while every virtual and host access boundary stays closed.
 */
test("the authentic String constructor stores a root File identity", () => {
	const runtime = createRuntime();
	const file = runtime.heap.allocate(JAVA_FILE);
	const text = createJavaString(runtime, "/");
	constructJavaFile(runtime, constructorRecord(), [file, text]);
	assert.equal(readJavaFilePath(runtime, file), "/");
	assert.equal(javaFileName(runtime, file), "");
	assert.equal(javaFileParent(runtime, file), null);
	const uri = createJavaFileUri(runtime, file, "Ljava/net/URI;");
	assert.equal(readJavaFileUri(runtime, uri), "file:///");
});

test("lexical File paths preserve absolute and package-relative identities", () => {
	const root = "/data/data/com.example.app";
	assert.equal(normalizeJavaFileIdentityPath("files/a", root), `${root}/files/a`);
	assert.equal(normalizeJavaFileIdentityPath("/a/./b/../c", root), "/a/c");
	assert.equal(normalizeJavaFileIdentityPath("\\root\\child", root), "/root/child");
	assert.equal(joinJavaFileIdentityPath(root, "/", "child"), "/child");
	assert.equal(joinJavaFileIdentityPath(root, root, "/absolute"), "/absolute");
	assert.equal(joinJavaFileIdentityPath(root, `${root}/files`, "../cache"), `${root}/cache`);
	assert.equal(isPackageScopedJavaFilePath(`${root}/files/a`, root), true);
	assert.equal(isPackageScopedJavaFilePath("/", root), false);
});

test("File identity does not weaken package filesystem enforcement", () => {
	const runtime = createRuntime();
	const root = runtime.filesystem.root;
	assert.throws(
		() => normalizeAndroidPath("/", root),
		error => error.code === "ANDROID_FILE_OUTSIDE_PACKAGE"
	);
	assert.throws(
		() => runtime.filesystem.write("/", "forbidden"),
		error => error.code === "ANDROID_FILE_OUTSIDE_PACKAGE"
	);
	assert.throws(
		() => runtime.filesystem.write("/data/data/other.app/file", "forbidden"),
		error => error.code === "ANDROID_FILE_OUTSIDE_PACKAGE"
	);
});

function createRuntime() {
	return {
		filesystem: createAndroidFilesystem("com.example.app"),
		heap: createDalvikObjectHeap()
	};
}

function constructorRecord() {
	return {
		method: {
			descriptor: "(Ljava/lang/String;)V"
		}
	};
}
