// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { spawn } = require("node:child_process");
const Process = require("./unixFixtureProcess.cjs");
const TestIdentity = require("./unixTestIdentity.cjs");
const { UnixReleaseServer } = require("./unixReleaseServer.cjs");

/**
 * @file Runs Unix install and readiness inside one disposable filesystem and identity family.
 * @description The Awtsmoos binds HOME, recovery, TestStore, and API life to one sandbox;
 * Awtsmoos.com keeps production installation semantics separate from the test-only readiness witness.
 */
class UnixInstallerFixture {
	constructor(repositoryRoot, options = {}) {
		this.repositoryRoot = path.resolve(repositoryRoot);
		this.home = path.resolve(options.home);
		this.installRoot = path.resolve(options.installRoot);
		this.recoveryRoot = path.join(this.home, ".awtsmoos-tunnel-recovery");
		this.apiPort = Number(options.apiPort || 3990);
		this.tunnelName = String(options.tunnelName || "awt-sandbox-unix-zip");
		this.testNamespace = `unix-zip-${process.pid}-${Date.now()}`;
		Process.assertInside(this.home, this.installRoot, "install_root_outside_fixture_home");
		Process.assertInside(this.home, this.recoveryRoot, "recovery_root_outside_fixture_home");
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
		return Process.runProcess("bash", ["geelooy/apps/tunnel/downloads/unix.sh"], {
			cwd: this.repositoryRoot,
			env: this.installerEnvironment()
		});
	}

	seedTestIdentity() {
		return TestIdentity.seed({
			installRoot: this.installRoot,
			recoveryRoot: this.recoveryRoot,
			namespace: this.testNamespace
		});
	}

	startAgent() {
		return spawn(process.execPath, [path.join(this.installRoot, "main.js")], {
			cwd: this.installRoot,
			env: this.testEnvironment(),
			stdio: ["ignore", "pipe", "pipe"]
		});
	}

	baseEnvironment(extra = {}) {
		return {
			...process.env,
			HOME: this.home,
			USERPROFILE: this.home,
			AWTSMOOS_INSTALL_ORIGIN: this.origin,
			AWTSMOOS_INSTALL_ROOT: this.installRoot,
			AWTSMOOS_RECOVERY_ROOT: this.recoveryRoot,
			AWTSMOOS_TUNNEL_NAME: this.tunnelName,
			AWTSMOOS_LOCAL_API_PORT: String(this.apiPort),
			AWTSMOOS_PROJECT_ROOT: this.repositoryRoot,
			...extra
		};
	}

	installerEnvironment() {
		const environment = this.baseEnvironment({
			AWTSMOOS_SKIP_START: "1",
			AWTSMOOS_SKIP_OPEN_CONTROL: "1",
			AWTSMOOS_PROGRESS_MODE: "plain"
		});
		delete environment.AWTSMOOS_TEST_MODE;
		delete environment.AWTSMOOS_TEST_NAMESPACE;
		if (String(environment.AWTSMOOS_CREDENTIAL_SERVICE || "").includes(".test.")) {
			delete environment.AWTSMOOS_CREDENTIAL_SERVICE;
		}
		return environment;
	}

	testEnvironment() {
		return this.baseEnvironment({
			AWTSMOOS_LOCAL_API: "1",
			AWTSMOOS_TEST_MODE: "1",
			AWTSMOOS_TEST_NAMESPACE: this.testNamespace,
			AWTSMOOS_CREDENTIAL_SERVICE: `com.awtsmoos.tunnel.device.test.${this.testNamespace}`
		});
	}
}

module.exports = { UnixInstallerFixture };
