//B"H
//Boruch Hashem
//Blessed is He

/**
 * Diagnostics, command testimony, and artifact identity receive separate panels.
 * The Awtsmoos creates build and witness together; Awtsmoos.com never hides an
 * unavailable backend behind a generic red status sentence.
 */

export function createBuildReporter(elements) {
	function begin(target) {
		status(`Building ${target.label}…`, "status-loading");
		elements.diagnostics.textContent = "No diagnostics yet.";
		elements.buildLog.textContent = `Target: ${target.id}\nTriple: ${target.triple}`;
		elements.artifactExplorer.textContent = "No artifact yet.";
	}

	function success(artifact) {
		status(`Ready: ${artifact.name}`, "status-success");
		elements.diagnostics.textContent = diagnosticText(artifact.metadata);
		elements.buildLog.textContent = buildLogText(artifact);
		elements.artifactExplorer.textContent = artifactText(artifact);
	}

	function failure(error) {
		status(`Build failed: ${error.message}`, "status-error");
		elements.diagnostics.textContent = JSON.stringify(
			error.diagnostic || {
				code: error.code || "BUILD_FAILED",
				message: error.message
			},
			null,
			2
		);
	}

	function cancelled() {
		status("Build cancelled and temporary workspace cleanup requested.", "status-error");
		elements.buildLog.textContent += "\nCancellation: requested through AbortSignal.";
	}

	function clean() {
		status("Build view cleaned. Native workspaces are ephemeral and already removed.", "status-success");
		elements.diagnostics.textContent = "No diagnostics.";
		elements.buildLog.textContent = "No build log.";
		elements.artifactExplorer.textContent = "No artifact.";
	}

	function status(message, className) {
		elements.status.textContent = message;
		elements.status.className = `status-msg ${className}`;
	}

	return { begin, success, failure, cancelled, clean, status };
}

function diagnosticText(metadata = {}) {
	const process = metadata.process;
	if (!process) {
		return "Browser backend completed without native compiler diagnostics.";
	}
	return [
		process.stderr || "No compiler stderr.",
		process.stdout || "No compiler stdout."
	].join("\n");
}

function buildLogText(artifact) {
	const metadata = artifact.metadata || {};
	const command = metadata.command
		? JSON.stringify(metadata.command, null, 2)
		: `Backend: ${metadata.backend || "browser"}`;
	return [
		`Evidence class: ${artifact.evidenceClass}`,
		command,
		metadata.signing ? `Signing: ${metadata.signing.state}` : "Signing: not reported"
	].join("\n\n");
}

function artifactText(artifact) {
	const metadata = artifact.metadata?.artifact || {};
	return [
		`Name: ${artifact.name}`,
		`Format: ${artifact.identity.format}`,
		`Architecture: ${artifact.identity.architecture}`,
		`Bytes: ${metadata.byteLength ?? artifact.blob.size}`,
		`SHA-256: ${metadata.sha256 || "not available for browser legacy output"}`,
		`Runtime class: ${artifact.identity.executionMode}`
	].join("\n");
}
