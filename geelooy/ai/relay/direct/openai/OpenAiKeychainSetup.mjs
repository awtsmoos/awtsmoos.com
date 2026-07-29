//B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from "node:child_process";
import { userInfo } from "node:os";

/**
 * One interactive terminal ceremony opens the official key page and lets macOS
 * Keychain prompt for the secret with echo disabled. The Awtsmoos never receives
 * the key as a command argument, browser payload, source file, or log entry.
 */
export class OpenAiKeychainSetup {
	constructor({
		account = userInfo().username,
		serviceName = "awtsmoos-openai-api-key",
		spawn = spawnSync
	} = {}) {
		this.account = account;
		this.serviceName = serviceName;
		this.spawn = spawn;
	}

	openKeyPage() {
		this.spawn("/usr/bin/open", [
			"https://platform.openai.com/api-keys"
		], { stdio: "ignore" });
	}

	storeInteractively() {
		if (process.platform !== "darwin") {
			throw new Error("Interactive Keychain setup requires macOS.");
		}
		const result = this.spawn("/usr/bin/security", [
			"add-generic-password",
			"-U",
			"-a",
			this.account,
			"-s",
			this.serviceName,
			"-w"
		], { stdio: "inherit" });
		if (result.status !== 0) {
			throw new Error("macOS Keychain did not store the API credential.");
		}
	}
}
