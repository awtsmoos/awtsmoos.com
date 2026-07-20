// B"H
// Boruch Hashem
// Blessed is He
const { spawn } = require("node:child_process");

/** Runs the local bootstrap file while capturing complete output. */
function runInstaller(scriptPath, environment, workingDirectory) {
	return run("bash", [scriptPath], environment, workingDirectory);
}

/** Runs the user's exact HTTP curl-pipe-bash installer command. */
function runHttpInstaller(origin, environment, workingDirectory) {
	return run("bash", [
		"-c",
		"curl -fsSL \"$AWTSMOOS_INSTALL_ORIGIN/api/tunnel/install/unix\" | bash"
	], {
		...environment,
		AWTSMOOS_INSTALL_ORIGIN: origin
	}, workingDirectory);
}

function run(command, argumentsList, environment, workingDirectory) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, argumentsList, {
			cwd: workingDirectory,
			env: { ...process.env, ...environment },
			stdio: ["ignore", "pipe", "pipe"]
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", chunk => { stdout += chunk; });
		child.stderr.on("data", chunk => { stderr += chunk; });
		child.once("error", reject);
		child.once("close", (status, signal) => {
			resolve({ status, signal, stdout, stderr });
		});
	});
}

module.exports = { runHttpInstaller, runInstaller };
