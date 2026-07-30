//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals readiness through the ordinary DOM vessel, never through a
 * lagging page-script promise. Awtsmoos.com asks Chrome for nodes and geometry only,
 * preserving credentials, avoiding Runtime.evaluate, and keeping custom GPTs bright.
 */
export class PageStateInspector {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	async inspect() {
		await this.cdpClient.send("DOM.enable", {}).catch(() => undefined);
		const document = await this.cdpClient.send("DOM.getDocument", {
			depth: 1,
			pierce: true
		});
		const rootNodeId = document.root.nodeId;
		const composerVisible = await this.firstVisible(rootNodeId, [
			'div#prompt-textarea[contenteditable="true"]',
			'textarea#mobile-composer-prompt',
			'textarea[aria-label="Chat with ChatGPT"]',
			'[contenteditable="true"][role="textbox"]'
		]);
		const loginVisible = await this.firstVisible(rootNodeId, [
			'[data-testid="login-button"]',
			'a[href^="/auth/login"]',
			'a[href*="auth/login"]'
		]);
		const challenge = await this.firstVisible(rootNodeId, [
			'#challenge-form',
			'[id*="cf-chl"]',
			'form[action*="challenge"]'
		]);
		const target = await this.targetInfo();
		const authenticated = Boolean(composerVisible && !loginVisible && !challenge);
		return {
			title: target.title,
			url: target.url,
			composerVisible: Boolean(composerVisible),
			loginVisible: Boolean(loginVisible),
			challenge: Boolean(challenge),
			authenticated,
			session: {
				status: authenticated ? 200 : null,
				hasUser: authenticated,
				hasAccessToken: authenticated
			},
			mode: challenge ? "challenge" : authenticated ? "authenticated" : "guest"
		};
	}

	async firstVisible(rootNodeId, selectors) {
		for (const selector of selectors) {
			const result = await this.cdpClient.send("DOM.querySelector", {
				nodeId: rootNodeId,
				selector
			}).catch(() => null);
			if (!result?.nodeId) continue;
			const box = await this.cdpClient.send("DOM.getBoxModel", {
				nodeId: result.nodeId
			}).catch(() => null);
			if (box?.model) return result.nodeId;
		}
		return 0;
	}

	async targetInfo() {
		const result = await this.cdpClient.send("Target.getTargetInfo", {});
		return {
			title: result.targetInfo?.title ?? "",
			url: result.targetInfo?.url ?? ""
		};
	}
}
