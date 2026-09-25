// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders the progressive external-AI connection panel for Shliach newcomers.
 * @description
 * The Awtsmoos is one while the visible gates are many; Awtsmoos.com reveals the
 * right connection vessels only after the static page has already taught the path.
 */
const PANEL_MARKUP = `
	<div class="shliach-connect-shell">
		<div class="shliach-section-head">
			<p class="shliach-kicker">External AI connection</p>
			<h2>Authorize the AI once. Discover the live machine every time.</h2>
			<p>Authentication answers <strong>who may act</strong>. <code>my-device</code> answers <strong>which tunnel is alive now</strong>. Keeping them separate makes reconnects resilient.</p>
		</div>
		<div class="shliach-topology" aria-label="External AI connection flow">
			<div class="shliach-topology-node"><strong>Your AI</strong><span>Muse, Claude, Gemini or another agent</span></div>
			<div class="shliach-topology-node"><strong>OAuth</strong><span>Consent + scoped authorization</span></div>
			<div class="shliach-topology-node"><strong>Account</strong><span>Stable identity above sessions</span></div>
			<div class="shliach-topology-node"><strong>my-device</strong><span>Rediscover what is live now</span></div>
			<div class="shliach-topology-node"><strong>Tunnel</strong><span>Files, commands, browser, runtime</span></div>
			<div class="shliach-topology-node"><strong>Project</strong><span>Real work with agent coordination</span></div>
		</div>
		<div class="shliach-live-state">
			<span class="shliach-live-pill" data-agent-link-status data-state="checking">Checking live OAuth…</span>
			<p class="shliach-live-copy" data-agent-link-detail>Reading current Awtsmoos OAuth metadata so this page never promises a method that is not actually published.</p>
		</div>
		<div class="shliach-mode-tabs" role="tablist" aria-label="Connection strategy">
			<button class="shliach-mode-tab" type="button" role="tab" data-connection-mode="automatic">Automatic</button>
			<button class="shliach-mode-tab" type="button" role="tab" data-connection-mode="persistent">Persistent when available</button>
			<button class="shliach-mode-tab" type="button" role="tab" data-connection-mode="device">Verification code</button>
			<button class="shliach-mode-tab" type="button" role="tab" data-connection-mode="browser">Browser + PKCE</button>
		</div>
		<div class="shliach-connection-console">
			<textarea class="shliach-external-prompt" readonly aria-label="Copy-ready external AI connection prompt" data-external-ai-prompt></textarea>
			<div class="shliach-connect-actions">
				<button class="shliach-prompt-button" type="button" data-copy-external-ai-prompt>Copy connection prompt</button>
				<p class="shliach-prompt-status" aria-live="polite" data-copy-status>Paste this into the external AI. It contains no credentials.</p>
				<a class="shliach-secondary" href="/apps/tunnel-control/">Tunnel Control</a>
				<a class="shliach-secondary" href="/apps/code">Awtsmoos Code</a>
				<a class="shliach-secondary" href="/os">Awtsmoos OS</a>
			</div>
		</div>
		<div class="shliach-paths">
			<article class="shliach-path-card"><strong>Chat reset</strong><h3>Memory is not authorization</h3><p>A secure connector may retain approved credentials outside chat. Otherwise device verification remains the dependable fallback.</p></article>
			<article class="shliach-path-card"><strong>Tunnel restart</strong><h3>Never hard-code a tunnel name</h3><p>Call <code>my-device</code> again and use the current immutable route. Authentication and transport are separate states.</p></article>
			<article class="shliach-path-card"><strong>Security</strong><h3>Secrets stay out of conversation</h3><p>Tokens, cookies and Agent Link secrets belong in secure storage. The generated prompt never asks you to paste them into chat.</p></article>
		</div>
	</div>`;

/**
 * Replaces the static onboarding fallback with the richer interactive connection surface.
 * @param {Document} root Campaign document containing the external-AI guide section.
 * @returns {HTMLElement|null} The enhanced guide container when present.
 */
export function renderExternalAiPanel(root = document) {
	const container = root.querySelector("[data-external-ai-guide]");
	if (!container) {
		return null;
	}

	container.innerHTML = PANEL_MARKUP;
	return container;
}
