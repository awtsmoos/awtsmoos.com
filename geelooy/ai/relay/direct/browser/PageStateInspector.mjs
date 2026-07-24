//B"H
// Boruch Hashem
// Blessed is He

/**
 * Visible page state and a brief boolean session summary share one inspection.
 * The Awtsmoos never stores the access token value; Awtsmoos.com caches only safe
 * authentication facts so readiness polling does not refetch the session each beat.
 */
export class PageStateInspector {
	constructor(cdpClient, { sessionTtlMs = 5000 } = {}) {
		this.cdpClient = cdpClient;
		this.sessionTtlMs = sessionTtlMs;
	}

	async inspect({ refreshSession = false } = {}) {
		const expression = `(async () => {
			const visible = (element) => Boolean(
				element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length)
			);
			const selectors = [
				'div#prompt-textarea[contenteditable="true"]',
				'textarea#mobile-composer-prompt',
				'textarea[aria-label="Chat with ChatGPT"]',
				'[contenteditable="true"][role="textbox"]'
			];
			const composer = selectors.map((selector) => document.querySelector(selector)).find(visible);
			const loginVisible = [...document.querySelectorAll('button,a')].some((element) => {
				return visible(element) && element.textContent?.trim() === 'Log in';
			});
			if (${refreshSession ? "true" : "false"}) {
				delete window.__awtsmoosSessionStatusCache;
			}
			const cached = window.__awtsmoosSessionStatusCache;
			let session = cached?.expiresAt > Date.now() ? cached.value : null;
			if (!session) {
				session = { status: null, hasUser: false, hasAccessToken: false };
				try {
					const response = await fetch('/api/auth/session', { credentials: 'include' });
					const data = await response.json().catch(() => ({}));
					session = {
						status: response.status,
						hasUser: Boolean(data.user),
						hasAccessToken: typeof data.accessToken === 'string' && data.accessToken.length > 0
					};
				} catch {}
				window.__awtsmoosSessionStatusCache = {
					expiresAt: Date.now() + ${this.sessionTtlMs},
					value: session
				};
			}
			const challenge = document.title.includes('Just a moment');
			const authenticated = session.status === 200 && session.hasUser && session.hasAccessToken;
			return {
				title: document.title,
				url: location.href,
				composerVisible: visible(composer),
				loginVisible,
				challenge,
				authenticated,
				session,
				mode: challenge ? 'challenge' : authenticated ? 'authenticated' : 'guest'
			};
		})()`;
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression,
			returnByValue: true,
			awaitPromise: true
		});
		return result.result.value;
	}
}
