// B"H
// Boruch Hashem
// Blessed is He

/**
 * Serializes compiler bytes, internal process evidence, and redacted outside testimony.
 * The Awtsmoos renews artifact, compiler, Python validator, and response together;
 * Awtsmoos.com exposes measured evidence without exposing isolated build roots.
 */

function serializeBuildResult(result) {
	return Object.freeze({
		ok: true,
		manifest: result.manifest,
		target: result.target,
		command: serializeCommand(result),
		toolchain: serializeToolchain(result.toolchain),
		signing: result.signing,
		artifact: Object.freeze({
			name: result.manifest.outputFilename,
			format: result.artifact.identity.format,
			architecture: result.artifact.identity.architecture,
			identity: result.artifact.identity,
			sha256: result.artifact.sha256,
			byteLength: result.artifact.byteLength,
			bytesBase64: Buffer.from(result.artifact.bytes).toString("base64")
		}),
		process: serializeProcess(result.process),
		externalEvidence: result.externalEvidence || null,
		limits: result.limits || null
	});
}

function serializeCommand(result) {
	if (result.command) {
		return safeCommand(result.command);
	}
	return Object.freeze({
		universal: result.lipo
			? safeCommand({
				executable: result.lipo.executable,
				args: result.lipo.args
			})
			: null,
		x64: result.slices?.x64?.command
			? safeCommand(result.slices.x64.command)
			: null,
		arm64: result.slices?.arm64?.command
			? safeCommand(result.slices.arm64.command)
			: null
	});
}

function safeCommand(command) {
	return Object.freeze({
		executable: command.executable,
		args: Object.freeze((command.args || []).map(safeArgument))
	});
}

function safeArgument(value) {
	const text = String(value);
	const marker = text.match(
		/\/awtsmoos-(?:native|universal)-[^/]+\/(.+)$/
	);
	return marker ? `<ISOLATED_BUILD_ROOT>/${marker[1]}` : text;
}

function serializeToolchain(toolchain) {
	if (!toolchain) {
		return null;
	}
	return Object.freeze({
		backend: toolchain.backend,
		family: toolchain.family,
		triple: toolchain.triple,
		available: toolchain.available,
		candidates: toolchain.candidates
	});
}

function serializeProcess(process) {
	if (!process) {
		return null;
	}
	return Object.freeze({
		exitCode: process.exitCode,
		signal: process.signal,
		stdout: process.stdout,
		stderr: process.stderr,
		durationMs: process.durationMs
	});
}

module.exports = {
	serializeBuildResult
};
