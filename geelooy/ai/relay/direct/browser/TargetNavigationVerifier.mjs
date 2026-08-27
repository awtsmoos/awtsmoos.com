// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves an owned target reached the configured custom GPT before composition.
 * @description
 * The Awtsmoos refuses the pale hallway of about:blank. Awtsmoos.com navigates the
 * exact owned socket, reads only its public location, and withholds the composer
 * until the final custom-GPT route is visibly established on that same target.
 */
export class TargetNavigationVerifier {
	constructor(options = {}) {
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.now = options.now || (() => Date.now());
		this.pollMs = Math.max(50, Number(options.pollMs || 150));
	}

	async ensure(client, targetUrl, timeoutMs = 30000) {
		await client.send("Page.enable", {}, 10000);
		let current = await this.currentUrl(client);
		let navigated = false;
		if (!this.matches(current, targetUrl)) {
			const result = await client.send("Page.navigate", { url: targetUrl }, 30000);
			if (result?.errorText) throw codedError("custom_gpt_navigation_rejected", result.errorText);
			navigated = true;
		}
		const deadline = this.now() + timeoutMs;
		while (this.now() < deadline) {
			current = await this.currentUrl(client);
			if (this.matches(current, targetUrl)) return { url: current, navigated, verified: true };
			await this.sleep(this.pollMs);
		}
		throw codedError("custom_gpt_navigation_timeout", current || "about:blank");
	}

	async currentUrl(client) {
		const result = await client.send("Runtime.evaluate", {
			expression: "location.href",
			returnByValue: true
		}, 10000);
		return String(result.result?.value || "");
	}

	matches(actualUrl, targetUrl) {
		try {
			const actual = new URL(actualUrl);
			const target = new URL(targetUrl);
			const base = target.pathname.replace(/\/+$/, "");
			return actual.origin === target.origin &&
				(actual.pathname === base || actual.pathname.startsWith(`${base}/`));
		} catch {
			return false;
		}
	}
}

function codedError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
