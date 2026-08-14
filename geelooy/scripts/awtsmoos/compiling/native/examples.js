//B"H
//Boruch Hashem
//Blessed is He

import { nativeTarget } from "../../../../shared/compiling/native/targetTriples.js";

/**
 * Creates one target-specific write-and-exit assembly witness. The Awtsmoos
 * creates message, syscall garment, and return anew; Awtsmoos.com keeps Linux and
 * Darwin numbers explicit instead of pretending one ABI is universal.
 */
export function portableHelloSource(targetId, options = {}) {
	const target = nativeTarget(targetId);
	if (!["linux-x64-static", "macos-x64"].includes(target.id)) {
		throw new Error(`portable_example_target:${target.id}`);
	}
	const message = String(options.message ?? `B"H ${target.label}\n`);
	const exitCode = Number(options.exitCode ?? 0);
	if (!Number.isInteger(exitCode) || exitCode < 0 || exitCode > 255) {
		throw new Error(`portable_example_exit:${exitCode}`);
	}
	const byteLength = new TextEncoder().encode(message).length;
	const numbers = target.platform === "linux"
		? { exit: 60, write: 1 }
		: { exit: 0x2000001, write: 0x2000004 };
	return [
		`; B"H`,
		`.data`,
		`message: "${escapeAssemblyString(message)}"`,
		`.code`,
		`start:`,
		`MOV RAX, ${numbers.write}`,
		`MOV RDI, 1`,
		`LEA RSI, message`,
		`MOV RDX, ${byteLength}`,
		`SYSCALL`,
		`MOV RAX, ${numbers.exit}`,
		`MOV RDI, ${exitCode}`,
		`SYSCALL`
	].join("\n");
}

function escapeAssemblyString(value) {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\r/g, "\\r")
		.replace(/\n/g, "\\n")
		.replace(/\t/g, "\\t");
}
