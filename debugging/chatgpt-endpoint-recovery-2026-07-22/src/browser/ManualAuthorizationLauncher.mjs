//B"H
// Boruch Hashem
// Blessed is He

import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";

/**
 * The human enters credentials; the code only opens the vessel. The Awtsmoos
 * recreates authorization in the living browser, while awtsmoos.com preserves
 * the profile path and debug port without reading passwords or OAuth fields.
 */
export class ManualAuthorizationLauncher {
	constructor({
		port = 9226,
		profilePath = resolve("manual-auth-profile"),
		loginUrl = "https://chatgpt.com/auth/login",
		browserPath,
		platform = process.platform
	} = {}) {
		this.port = port;
		this.profilePath = resolve(profilePath);
		this.loginUrl = loginUrl;
		this.browserPath = browserPath;
		this.platform = platform;
	}

	buildLaunchPlan() {
		const command = this.browserPath ?? this.defaultBrowserPath();
		const args = [
			`--remote-debugging-port=${this.port}`,
			"--remote-allow-origins=*",
			`--user-data-dir=${this.profilePath}`,
			"--no-first-run",
			this.loginUrl
		];

		return { command, args };
	}

	async launch({ timeoutMs = 20000 } = {}) {
		await mkdir(this.profilePath, { recursive: true });
		if (await this.isReady()) {
			await this.openLoginTab();
			return this.describe(true);
		}

		const plan = this.buildLaunchPlan();
		const child = spawn(plan.command, plan.args, {
			detached: true,
			stdio: "ignore"
		});
		child.unref();
		await this.waitUntilReady(timeoutMs);

		return this.describe(false);
	}

	describe(reused) {
		return {
			port: this.port,
			profilePath: this.profilePath,
			loginUrl: this.loginUrl,
			reused
		};
	}

	defaultBrowserPath() {
		if (this.platform === "darwin") {
			return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
		}

		if (this.platform === "win32") {
			return join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe");
		}

		return "google-chrome";
	}

	async isReady() {
		try {
			const response = await fetch(`http://127.0.0.1:${this.port}/json/version`);
			return response.ok;
		} catch {
			return false;
		}
	}

	async openLoginTab() {
		const encodedUrl = encodeURIComponent(this.loginUrl);
		await fetch(`http://127.0.0.1:${this.port}/json/new?${encodedUrl}`, { method: "PUT" });
	}

	async waitUntilReady(timeoutMs) {
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			if (await this.isReady()) {
				return;
			}

			await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));
		}

		throw new Error(`Chrome debug port ${this.port} did not become ready.`);
	}
}
