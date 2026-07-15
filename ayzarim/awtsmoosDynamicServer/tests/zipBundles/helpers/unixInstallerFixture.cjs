// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { spawn } = require("node:child_process");
const { UnixReleaseServer } = require("./unixReleaseServer.cjs");

/**
 * B"H
 *
 * The fixture binds installation and child execution to one disposable root.
 * The Awtsmoos renews HOME, install root, config, working directory, and API port
 * together; Awtsmoos.com cannot accidentally awaken the user's live configuration.
 */
class UnixInstallerFixture {
	constructor(repositoryRoot, options = {}) {
		this.repositoryRoot = path.resolve(repositoryRoot);
		this.installRoot = path.resolve(options.installRoot);
		this.home = path.resolve(options.home);
		this.apiPort = Number(options.apiPort || 3990);
		this.tunnelName = String(options.tunnelName || "awt-sandbox-unix-zip");
		this.release = new UnixReleaseServer(this.repositoryRoot);
	}

	async start(port = 8082) {
		this.origin = await this.release.start(port);
		return this.origin;
	}

	close() {
		return this.release.close();
	}

	runInstaller() {
		return runProcess("bash", ["geelooy/apps/tunnel/downloads/unix.sh"], {
			cwd: this.repositoryRoot,
			env: this.environment({
				AWTSMOOS_SKIP_START: "1",
				AWTSMOOS_SKIP_OPEN_CONTROL: "1",
				AWTSMOOS_PROGRESS_MODE: "plain"
			})
		});
	}

	startAgent() {
		return spawn(process.execPath, [path.join(this.installRoot, "main.js")], {
			cwd: this.installRoot,
			env: this.environment({
				USERPROFILE: this.home,
				AWTSMOOS_LOCAL_API: "1"
			}),
			stdio: ["ignore", "pipe", "pipe"]
		});
	}

	environment(extra = {}) {
		return {
			...process.env,
			HOME: this.home,
			AWTSMOOS_INSTALL_ORIGIN: this.origin,
			AWTSMOOS_INSTALL_ROOT: this.installRoot,
			AWTSMOOS_TUNNEL_NAME: this.tunnelName,
			AWTSMOOS_LOCAL_API_PORT: String(this.apiPort),
			AWTSMOOS_PROJECT_ROOT: this.repositoryRoot,
			...extra
		};
	}
}

async function runProcess(command, args, options) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, options);
		let stdout = "";
		let stderr = "";
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
			reject(new Error(`unix installer timeout\n${stdout}\n${stderr}`));
		}, 120000);
		child.stdout.on("data", chunk => { stdout += chunk; });
		child.stderr.on("data", chunk => { stderr += chunk; });
		child.once("error", error => {
			clearTimeout(timer);
			reject(error);
		});
		child.once("exit", code => {
			clearTimeout(timer);
			if (code === 0) resolve({ stdout, stderr });
			else reject(new Error(`unix installer failed ${code}\n${stdout}\n${stderr}`));
		});
	});
}

module.exports = { UnixInstallerFixture };
