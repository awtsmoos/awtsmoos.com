//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { writeElf64SharedObject } from "../../../../../../shared/compiling/native/elf64/sharedObject.js";
import { compileJavaActivityApk } from "../compiler.js";

// mov w0, #0 ; ret — minimal ANativeActivity_onCreate that just returns.
const ON_CREATE_TEXT = Uint8Array.from([
	0x00, 0x00, 0x80, 0x52,
	0xc0, 0x03, 0x5f, 0xd6
]);

const JAVA_SOURCE = `package com.awtsmoos.merkava;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView view = new TextView(this);
        view.setText("Blessed");
        setContentView(view);
    }
}`;

function buildSo() {
	return writeElf64SharedObject({
		exports: [{ name: "ANativeActivity_onCreate", offset: 0, size: 8 }],
		soname: "libmerkava.so",
		text: ON_CREATE_TEXT
	}).bytes;
}

function parseZip(bytes) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	let eocd = -1;
	for (let index = bytes.length - 22; index >= 0; index -= 1) {
		if (view.getUint32(index, true) === 0x06054b50) {
			eocd = index;
			break;
		}
	}
	assert.notEqual(eocd, -1, "EOCD found");
	const count = view.getUint16(eocd + 10, true);
	const centralOffset = view.getUint32(eocd + 16, true);
	const entries = [];
	let at = centralOffset;
	for (let index = 0; index < count; index += 1) {
		assert.equal(view.getUint32(at, true), 0x02014b50, "central signature");
		const method = view.getUint16(at + 10, true);
		const compressedSize = view.getUint32(at + 20, true);
		const uncompressedSize = view.getUint32(at + 24, true);
		const nameLength = view.getUint16(at + 28, true);
		const extraLength = view.getUint16(at + 30, true);
		const commentLength = view.getUint16(at + 32, true);
		const localOffset = view.getUint32(at + 42, true);
		const name = new TextDecoder().decode(bytes.slice(at + 46, at + 46 + nameLength));
		assert.equal(view.getUint32(localOffset, true), 0x04034b50, "local signature");
		const localMethod = view.getUint16(localOffset + 8, true);
		const localNameLength = view.getUint16(localOffset + 26, true);
		const localExtraLength = view.getUint16(localOffset + 28, true);
		const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
		entries.push({
			compressedSize,
			dataOffset,
			localMethod,
			localOffset,
			method,
			name,
			uncompressedSize
		});
		at += 46 + nameLength + extraLength + commentLength;
	}
	return entries;
}

test("packages the .so at lib/arm64-v8a/libmerkava.so, stored and page-aligned", async () => {
	const soBytes = buildSo();
	const apk = await compileJavaActivityApk(JAVA_SOURCE, {
		label: "Merkava",
		nativeActivity: { libName: "merkava" },
		nativeLibs: { "arm64-v8a": { "libmerkava.so": soBytes } }
	});
	const entries = parseZip(apk.bytes);
	const names = entries.map(entry => entry.name).sort();
	assert.deepEqual(names, [
		"AndroidManifest.xml",
		"classes.dex",
		"lib/arm64-v8a/libmerkava.so"
	]);
	const lib = entries.find(entry => entry.name === "lib/arm64-v8a/libmerkava.so");
	assert.equal(lib.method, 0, "central method is stored");
	assert.equal(lib.localMethod, 0, "local method is stored");
	assert.equal(lib.compressedSize, soBytes.length);
	assert.equal(lib.uncompressedSize, soBytes.length);
	assert.equal(lib.dataOffset % 4096, 0, "native lib payload is page-aligned");
	assert.deepEqual(
		[...apk.bytes.slice(lib.dataOffset, lib.dataOffset + soBytes.length)],
		[...soBytes]
	);
	assert.deepEqual(apk.evidence.nativeLibs, [
		{ name: "lib/arm64-v8a/libmerkava.so", size: soBytes.length }
	]);
});

test("supports several ABIs and several libraries per ABI", async () => {
	const soBytes = buildSo();
	const apk = await compileJavaActivityApk(JAVA_SOURCE, {
		nativeLibs: {
			"arm64-v8a": { "libmerkava.so": soBytes, "libother.so": soBytes },
			"x86_64": { "libmerkava.so": soBytes }
		}
	});
	const names = parseZip(apk.bytes).map(entry => entry.name);
	assert.ok(names.includes("lib/arm64-v8a/libmerkava.so"));
	assert.ok(names.includes("lib/arm64-v8a/libother.so"));
	assert.ok(names.includes("lib/x86_64/libmerkava.so"));
	for (const entry of parseZip(apk.bytes)) {
		if (entry.name.startsWith("lib/")) {
			assert.equal(entry.dataOffset % 4096, 0, `${entry.name} aligned`);
		}
	}
});

test("declares NativeActivity with the lib_name meta-data in the manifest", async () => {
	const apk = await compileJavaActivityApk(JAVA_SOURCE, {
		nativeActivity: { libName: "libmerkava.so" },
		nativeLibs: { "arm64-v8a": { "libmerkava.so": buildSo() } }
	});
	const manifest = apk.bytes;
	// The AXML string pool is UTF-16LE (like aapt2): match raw byte sequences.
	const hasString = (s) => {
		const utf8 = new TextEncoder().encode(s);
		if (manifest.includes(utf8)) return true;
		const utf16 = new Uint8Array(s.length * 2);
		for (let i = 0; i < s.length; i++) {
			utf16[i * 2] = s.charCodeAt(i) & 0xff;
			utf16[i * 2 + 1] = (s.charCodeAt(i) >>> 8) & 0xff;
		}
		// Uint8Array.includes doesn't do subsequence; do a manual scan.
		outer: for (let i = 0; i + utf16.length <= manifest.length; i++) {
			for (let j = 0; j < utf16.length; j++) {
				if (manifest[i + j] !== utf16[j]) continue outer;
			}
			return true;
		}
		return false;
	};
	for (const required of [
		"android.app.NativeActivity",
		"android.app.lib_name",
		"merkava",
		"orientation|keyboardHidden",
		"configChanges",
		"meta-data"
	]) {
		assert.ok(hasString(required), `manifest carries ${required}`);
	}
	assert.deepEqual(apk.evidence.nativeActivity, {
		configChanges: "orientation|keyboardHidden",
		libName: "merkava"
	});
});

test("leaves the existing DEX/manifest path untouched when native options are absent", async () => {
	const first = await compileJavaActivityApk(JAVA_SOURCE, { label: "Merkava" });
	const second = await compileJavaActivityApk(JAVA_SOURCE, { label: "Merkava" });
	assert.deepEqual(first.bytes, second.bytes);
	const names = parseZip(first.bytes).map(entry => entry.name).sort();
	assert.deepEqual(names, ["AndroidManifest.xml", "classes.dex"]);
	const text = new TextDecoder().decode(first.bytes);
	assert.ok(!text.includes("NativeActivity"));
	assert.equal(first.evidence.nativeActivity, null);
	assert.deepEqual(first.evidence.nativeLibs, []);
});

test("rejects malformed nativeLibs and nativeActivity options", async () => {
	const soBytes = buildSo();
	await assert.rejects(
		compileJavaActivityApk(JAVA_SOURCE, { nativeLibs: { "../evil": { "libx.so": soBytes } } }),
		/APK_NATIVE_ABI_INVALID/
	);
	await assert.rejects(
		compileJavaActivityApk(JAVA_SOURCE, { nativeLibs: { "arm64-v8a": { "libx": soBytes } } }),
		/APK_NATIVE_LIB_NAME_INVALID/
	);
	await assert.rejects(
		compileJavaActivityApk(JAVA_SOURCE, {
			nativeLibs: { "arm64-v8a": { "../escape.so": soBytes } }
		}),
		/APK_NATIVE_LIB_NAME_INVALID/
	);
	await assert.rejects(
		compileJavaActivityApk(JAVA_SOURCE, {
			nativeLibs: { "arm64-v8a": { "libempty.so": new Uint8Array(0) } }
		}),
		/APK_NATIVE_LIB_EMPTY/
	);
	await assert.rejects(
		compileJavaActivityApk(JAVA_SOURCE, { nativeActivity: { libName: "not a lib!" } }),
		/APK_NATIVE_ACTIVITY_LIB_INVALID/
	);
	await assert.rejects(
		compileJavaActivityApk(JAVA_SOURCE, { nativeLibs: "nope" }),
		/APK_NATIVE_LIBS_OBJECT_REQUIRED/
	);
});
