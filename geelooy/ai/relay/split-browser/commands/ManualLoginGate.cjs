//B"H
// Boruch Hashem
// Blessed is He

const {
	openDebugChrome,
	closeDebugChrome
} = require("../cdpChrome.cjs");
const { findPageTarget } = require("../debugChromeDiscovery.cjs");
const { discoveryOptions } = require("../debugChromeLauncher.cjs");
const { createCdpClient } = require("../debugChromeWebSocket.cjs");

/**
 * The human alone crosses the login threshold. The Awtsmoos lets Awtsmoos.com
 * observe only a redacted authenticated verdict, close the visible chamber, and
 * carry no DOM gesture, credential value, user identifier, or page text onward.
 */
class ManualLoginGate {
	constructor({
		openBrowser = openDebugChrome,
		synchronizeCookies = async () => ({ ok: true, status: "profile_owned" }),
		readSession = browserSessionStatus,
		closeBrowser = closeDebugChrome,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		now = () => Date.now(),
		output = message => console.log(message)
	} = {}) {
		this.openBrowser = openBrowser;
		this.synchronizeCookies = synchronizeCookies;
		this.readSession = readSession;
		this.closeBrowser = closeBrowser;
		this.sleep = sleep;
		this.now = now;
		this.output = output;
	}

	async authenticate(config = {}, options = {}) {
		const timeoutMs = positiveNumber(
			options.timeoutMs,
			process.env.AWTSMOOS_LOGIN_TIMEOUT_MS,
			600000
		);
		const pollMs = positiveNumber(
			options.pollMs,
			process.env.AWTSMOOS_LOGIN_POLL_MS,
			2000
		);
		const opened = await this.openBrowser({
			...config,
			launchUrl: config.targetOrigin || "https://chatgpt.com"
		});
		if (!opened.ok) {
			throw codedError("debug_chrome_open_failed");
		}
		this.output("Visible ChatGPT login opened. Sign in manually; automation will not touch the page.");
		const deadline = this.now() + timeoutMs;
		let attempts = 0;
		let previousStatus = "";
		while (this.now() <= deadline) {
			attempts += 1;
			await this.synchronizeCookies({
				...config,
				debugPort: opened.debugPort
			});
			const session = await this.readSession(config);
			if (session.status !== previousStatus) {
				this.output(`Authentication status: ${session.status}.`);
				previousStatus = session.status;
			}
			if (session.ok && session.status === "logged_in") {
				const closed = await this.closeBrowser({
					...config,
					debugPort: opened.debugPort
				});
				if (!closed.ok) {
					throw codedError("debug_chrome_close_failed");
				}
				return {
					ok: true,
					status: "authenticated",
					attempts,
					debugPort: opened.debugPort,
					browserClosed: true
				};
			}
			await this.sleep(pollMs);
		}
		await this.closeBrowser({
			...config,
			debugPort: opened.debugPort
		}).catch(() => undefined);
		throw codedError("manual_login_timeout");
	}
}

async function browserSessionStatus(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) {
		return { ok: false, status: "debug_chrome_unavailable" };
	}
	const client = await createCdpClient(target.webSocketDebuggerUrl);
	try {
		await client.send("DOM.enable", {}).catch(() => undefined);
		const document = await client.send("DOM.getDocument", { depth: 1, pierce: true });
		const composer = await firstVisibleNode(client, document.root.nodeId, [
			'div#prompt-textarea[contenteditable="true"]',
			'textarea#mobile-composer-prompt',
			'textarea[aria-label="Chat with ChatGPT"]',
			'[contenteditable="true"][role="textbox"]'
		]);
		const login = await firstVisibleNode(client, document.root.nodeId, [
			'[data-testid="login-button"]',
			'a[href^="/auth/login"]',
			'a[href*="auth/login"]'
		]);
		const challenge = await firstVisibleNode(client, document.root.nodeId, [
			'#challenge-form',
			'[id*="cf-chl"]',
			'form[action*="challenge"]'
		]);
		return {
			ok: true,
			status: composer && !login && !challenge ? "logged_in" : "not_logged_in"
		};
	} catch (error) {
		return {
			ok: false,
			status: "session_status_failed",
			detail: String(error?.message || error)
		};
	} finally {
		client.close();
	}
}

async function firstVisibleNode(client, rootNodeId, selectors) {
	for (const selector of selectors) {
		const result = await client.send("DOM.querySelector", {
			nodeId: rootNodeId,
			selector
		}).catch(() => null);
		if (!result?.nodeId) continue;
		const box = await client.send("DOM.getBoxModel", {
			nodeId: result.nodeId
		}).catch(() => null);
		if (box?.model) return result.nodeId;
	}
	return 0;
}

function positiveNumber(...values) {
	for (const value of values) {
		const number = Number(value);
		if (Number.isFinite(number) && number > 0) {
			return number;
		}
	}
	return 1;
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { ManualLoginGate, browserSessionStatus };
