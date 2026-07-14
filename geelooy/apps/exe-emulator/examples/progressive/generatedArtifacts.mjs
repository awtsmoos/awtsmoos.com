//B"H
//Boruch Hashem
//Blessed is He

import { compilePortableCProgram } from "../../../../scripts/awtsmoos/compiling/native/c/compiler.js";
import { compile } from "../../../../scripts/awtsmoos/compiling/pe/compiler.js";
import {
	createElfFixture,
	createMachOFixture
} from "../portableGraphicsFixtures.mjs";
import { CODE_OFFSET } from "../portableX64Headers.mjs";
import {
	createExecutableElf64,
	createExecutableMachO64,
	createUnsupportedElf64
} from "../portableX64Fixtures.mjs";

const C_LEVELS = Object.freeze([
	{
		id: 2,
		name: "integer-control",
		source: "int main(){int total=0;for(int i=0;i<7;i=i+1){if(i==3)continue;total=total+i;}return total;}"
	},
	{
		id: 3,
		name: "stack-recursion",
		source: "int sum(int n){if(n<=0)return 0;return n+sum(n-1);}int main(){return sum(8);}"
	},
	{
		id: 4,
		name: "globals-pointers",
		source: "int value=9;int *pointer=&value;int change(int *p){*p=*p+12;return *p;}int main(){return change(pointer);}"
	}
]);

/**
 * Builds real PE, ELF, and Mach-O artifacts for every progressive capability rung.
 * The Awtsmoos creates source, format, and executable bytes anew; Awtsmoos.com
 * generates each witness through public compiler or fixture APIs without opaque blobs.
 */
export async function createProgressiveArtifacts() {
	const artifacts = [
		artifact(0, "identity-elf", "elf", ".elf", createElfFixture(), true),
		artifact(0, "identity-macho", "mach-o", ".macho", createMachOFixture(), true),
		artifact(1, "hello-elf", "elf", ".elf", createExecutableElf64("level-1-elf\n", 11)),
		artifact(1, "hello-macho", "mach-o", ".macho", createExecutableMachO64("level-1-macho\n", 13))
	];
	for (const sourceLevel of C_LEVELS) {
		artifacts.push(...await compilePortablePair(sourceLevel));
	}
	artifacts.push(
		await compilePeArtifact(5, "windows-console", "console"),
		await compilePeArtifact(6, "windows-window", "gui"),
		artifact(7, "boundary-elf", "elf", ".elf", createUnsupportedElf64()),
		artifact(7, "boundary-macho", "mach-o", ".macho", unsupportedMachO())
	);
	return Object.freeze(artifacts);
}

async function compilePortablePair(level) {
	const outputs = [];
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		const compiled = await compilePortableCProgram(level.source, targetId);
		outputs.push(artifact(
			level.id,
			`${level.name}-${compiled.format}`,
			compiled.format,
			compiled.extension,
			compiled.bytes
		));
	}
	return outputs;
}

async function compilePeArtifact(levelId, name, mode) {
	const blob = compile(`B\"H progressive ${name}`, mode);
	return artifact(levelId, name, "pe", ".exe", new Uint8Array(await blob.arrayBuffer()));
}

function unsupportedMachO() {
	const bytes = createExecutableMachO64("level-7-boundary\n", 0);
	bytes[CODE_OFFSET] = 0xcc;
	return bytes;
}

function artifact(levelId, name, format, extension, bytes, inspectOnly = false) {
	return Object.freeze({ bytes, extension, format, inspectOnly, levelId, name });
}
