//B"H
// Boruch Hashem
// Blessed is He

/**
 * The owned host is judged by synchronous visible facts only. The Awtsmoos lets
 * Awtsmoos.com avoid session-fetch and socket stalls while observing the composer,
 * login marker, challenge title, current URL, and page readiness in one short beat.
 */
export class OwnedHostInspector {
	constructor(cdpClient, { timeoutMs = 4000 } = {}) {
		this.cdpClient = cdpClient;
		this.timeoutMs = timeoutMs;
	}

	async inspect() {
		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression: this.expression(),
			returnByValue: true
		}, this.timeoutMs);
		if (result.exceptionDetails) {
			throw new Error(
				result.exceptionDetails.exception?.description
					|| result.exceptionDetails.text
					|| "Owned host inspection failed."
			);
		}
		return result.result.value;
	}

	expression() {
		return `(() => {
			const visible = element => Boolean(
				element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length)
			);
			const composerSelectors = [
				'div#prompt-textarea[contenteditable="true"]',
				'textarea#mobile-composer-prompt',
				'textarea[aria-label="Chat with ChatGPT"]',
				'[contenteditable="true"][role="textbox"]'
			];
			const composer = composerSelectors
				.map(selector => document.querySelector(selector))
				.find(visible);
			const loginVisible = [...document.querySelectorAll('button,a')].some(element => {
				return visible(element) && element.textContent?.trim() === 'Log in';
			});
			const challenge = document.title.includes('Just a moment');
			const composerVisible = visible(composer);
			return {
				title: document.title,
				url: location.href,
				composerVisible,
				loginVisible,
				challenge,
				authenticated: composerVisible && !loginVisible && !challenge,
				mode: challenge ? 'challenge' : composerVisible ? 'authenticated' : 'loading'
			};
		})()`;
	}
}
