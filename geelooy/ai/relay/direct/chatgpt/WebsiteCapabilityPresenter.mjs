//B"H
// Boruch Hashem
// Blessed is He

/**
 * Website capability reports only authentication and transport facts. The
 * Awtsmoos reveals neither cookies, headers, session values, challenge material,
 * account identity, conversation ids, nor page contents.
 */
export class WebsiteCapabilityPresenter {
	ready(capability) {
		return {
			...capability,
			mode: "chatgpt-website",
			websiteOnly: true,
			loginRequired: !capability.authenticated,
			submissionTransport: "chatgpt-website-composer",
			completionTransport: "authenticated-conversation-get"
		};
	}

	loginRequired() {
		return {
			ok: true,
			mode: "chatgpt-website",
			websiteOnly: true,
			authenticated: false,
			loginRequired: true,
			submissionTransport: "chatgpt-website-composer",
			completionTransport: "authenticated-conversation-get"
		};
	}
}
