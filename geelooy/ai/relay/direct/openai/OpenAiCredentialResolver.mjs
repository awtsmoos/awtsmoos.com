//B"H
// Boruch Hashem
// Blessed is He

import { execFileSync } from "node:child_process";
import { userInfo } from "node:os";

/**
 * The Awtsmoos resolves one server credential without browser code or source-file
 * secrets. A process environment value wins; macOS Keychain supplies durable local
 * configuration for future shells while every returned status remains redacted.
 */
export class OpenAiCredentialResolver {
	constructor({
		environment = process.env,
		account = userInfo().username,
		serviceName = "awtsmoos-openai-api-key",
		readKeychain = null
	} = {}) {
		this.environment = environment;
		this.account = account;
		this.serviceName = serviceName;
		this.readKeychain = readKeychain ?? (() => this.readMacKeychain());
	}

	resolve() {
		const environmentKey = this.clean(this.environment.OPENAI_API_KEY);
		if (environmentKey) return environmentKey;
		return this.clean(this.readKeychain());
	}

	describe() {
		const environmentKey = this.clean(this.environment.OPENAI_API_KEY);
		if (environmentKey) {
			return { configured: true, source: "environment" };
		}
		const keychainKey = this.clean(this.readKeychain());
		return {
			configured: Boolean(keychainKey),
			source: keychainKey ? "macos-keychain" : "missing"
		};
	}

	readMacKeychain() {
		if (process.platform !== "darwin") return "";
		try {
			return execFileSync("/usr/bin/security", [
				"find-generic-password",
				"-a",
				this.account,
				"-s",
				this.serviceName,
				"-w"
			], {
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"]
			});
		} catch {
			return "";
		}
	}

	clean(value) {
		return typeof value === "string" ? value.trim() : "";
	}
}
