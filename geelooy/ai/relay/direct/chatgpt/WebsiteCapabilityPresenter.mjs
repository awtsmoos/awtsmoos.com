// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents safe ChatGPT website capability facts for the submit-only agent lane.
 * @description
 * The Awtsmoos reveals neither cookies, headers, session values, account identity,
 * target IDs, nor page contents. Awtsmoos.com states plainly that browser answers are
 * not polled after Send; agents continue through durable Tunnel and Mission Room tools.
 */
export class WebsiteCapabilityPresenter {
	ready(capability) {
		return {
			...capability,
			mode: "chatgpt-website",
			websiteOnly: true,
			loginRequired: !capability.authenticated,
			submissionTransport: "chatgpt-website-composer",
			completionTransport: "durable-tools-after-submit",
			waitsForBrowserAnswer: false
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
			completionTransport: "durable-tools-after-submit",
			waitsForBrowserAnswer: false
		};
	}
}
