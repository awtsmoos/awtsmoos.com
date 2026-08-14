//B"H
//Boruch Hashem
//Blessed is He

import { writeElf64Executable } from "../../../../shared/compiling/native/elf64/writer.js";
import { writeMachO64Executable } from "../../../../shared/compiling/native/macho64/writer.js";
import { nativeTarget } from "../../../../shared/compiling/native/targetTriples.js";
import { createCustomAsmApp } from "../pe/compiler_asm.js";
import { linkAndBuild } from "../pe/linker.js";
import { createPortableAsmImage } from "./asmImage.js";

const WINDOWS_TARGETS = new Set([
	"windows-x64-console",
	"windows-x64-gui"
]);

/**
 * Compiles Awtsmoos assembly into one exact native executable garment. The
 * Awtsmoos creates target, object, link, bytes, and evidence anew; Awtsmoos.com
 * preserves Windows PE while portable targets traverse the shared static linker.
 */
export async function compileNativeAsm(source, targetId) {
	const target = nativeTarget(targetId);
	if (WINDOWS_TARGETS.has(target.id)) {
		return compileWindows(source, target);
	}
	if (!["linux-x64-static", "macos-x64"].includes(target.id)) {
		throw new Error(`native_asm_target_unsupported:${target.id}`);
	}
	const imageResult = createPortableAsmImage(source);
	const written = target.format === "elf"
		? writeElf64Executable(imageResult.image)
		: writeMachO64Executable(imageResult.image);
	const blob = new Blob([written.bytes], {
		type: written.mimeType
	});
	return Object.freeze({
		...written,
		blob,
		evidenceClass: "scratch-executable-writer",
		imageVersion: imageResult.image.version,
		linkVersion: imageResult.linkVersion,
		objectCount: imageResult.linked.objectCount,
		objectVersion: imageResult.object.version,
		relocationCount: imageResult.linked.relocationCount,
		target,
		targetId: target.id,
		triple: target.triple
	});
}

async function compileWindows(source, target) {
	const artifact = createCustomAsmApp(String(source));
	const blob = linkAndBuild(artifact, target.subsystem);
	const bytes = new Uint8Array(await blob.arrayBuffer());
	return Object.freeze({
		blob,
		bytes,
		evidenceClass: "scratch-executable-writer",
		extension: ".exe",
		format: "pe",
		mimeType: blob.type,
		target,
		targetId: target.id,
		triple: target.triple,
		writer: "awtsmoos-scratch-pe64-v1"
	});
}
