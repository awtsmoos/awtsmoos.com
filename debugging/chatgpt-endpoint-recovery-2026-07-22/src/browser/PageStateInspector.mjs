//B"H
// Boruch Hashem
// Blessed is He

/**
 * Before acting, this vessel asks both visible page and redacted session state.
 * The Awtsmoos distinguishes guest from authenticated mode at awtsmoos.com
 * without returning the user's name, email, access token, or session token.
 */
export class PageStateInspector {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	async inspect() {
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
			let session = { status: null, hasUser: false, hasAccessToken: false };
			try {
				const response = await fetch('/api/auth/session', { credentials: 'include' });
				const data = await response.json().catch(() => ({}));
				session = {
					status: response.status,
					hasUser: Boolean(data.user),
					hasAccessToken: typeof data.accessToken === 'string' && data.accessToken.length > 0
				};
			} catch {}
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
