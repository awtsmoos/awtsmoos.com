// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the universal Torah discussion chamber while rendering, history, search, and transport live in smaller vessels.
 * @description Malchus gives presence, source discussion, bounded older history, and privacy one visible chamber without a free-text public mouth;
 * the Awtsmoos renews every selected Torah card, and Awtsmoos.com lets supporting publication explanation fold on phones while private retrieval and deliberate source selection remain permanently in sight.
 */

export class UniversalChatShell {
	constructor() {
		this.root = document.createElement("aside");
		this.root.className = "universal-chat-drawer";
		this.root.hidden = true;
		this.root.innerHTML = template();
		document.body.appendChild(this.root);
		this.elements = collectElements(this.root);
		this.setGuideDefault();
	}

	open() {
		this.root.hidden = false;
	}

	close() {
		this.root.hidden = true;
	}

	/** Uses viewport shape only for the initial explanatory fold; it never becomes permission, identity, or durable preference. */
	setGuideDefault() {
		this.elements.guide.open = typeof window.matchMedia !== "function"
			|| window.matchMedia("(min-width: 761px)").matches;
	}
}

function template() {
	return `
		<header class="universal-chat-header">
			<div><strong>Public Torah</strong><small id="universalChatIdentity">Ploni</small></div>
			<button id="universalChatClose" type="button" aria-label="Close Public Torah">×</button>
		</header>
		<div class="universal-chat-controls">
			<label class="universal-chat-view-control"><span>Feed</span><select id="universalChatView" aria-label="Public Torah feed"><option value="channel">This page</option><option value="site">Across Awtsmoos.com</option></select></label>
			<label class="universal-chat-privacy-control"><input id="universalChatHidden" type="checkbox"><span>Hide me from the public online count</span></label>
		</div>
		<div id="universalChatStatus" class="universal-chat-status" role="status" aria-live="polite"></div>
		<div id="universalChatRoster" class="universal-chat-roster"></div>
		<button id="universalChatOlder" class="universal-chat-older" type="button" hidden>Load older source posts</button>
		<div id="universalChatMessages" class="universal-chat-messages" aria-live="polite"></div>
		<section class="universal-chat-composer" aria-labelledby="universalChatComposerTitle">
			<div class="universal-chat-composer-intro">
				<strong id="universalChatComposerTitle">Bring a Torah source into the discussion</strong>
				<details id="universalChatComposerGuide" class="universal-chat-composer-guide">
					<summary>Private search · source-only publishing</summary>
					<small>Your search stays private. Only server-issued source cards you deliberately select can be published.</small>
				</details>
			</div>
			<label for="universalChatPrompt">What Torah idea do you want to explore?</label>
			<div class="universal-chat-search-row">
				<input id="universalChatPrompt" maxlength="500" autocomplete="off" placeholder="Search Torah sources…">
				<button id="universalChatSearch" type="button">Find sources</button>
			</div>
			<div id="universalChatResults" class="universal-chat-results"></div>
			<div id="universalChatSelectionSummary" class="universal-chat-selection-summary" aria-live="polite"></div>
			<div class="universal-chat-publish-row">
				<select id="universalChatPublishTarget" aria-label="Publish destination"><option value="context">Publish to this page</option><option value="global">Publish across Awtsmoos.com</option></select>
				<button id="universalChatPublish" type="button" disabled>Publish selected sources</button>
			</div>
		</section>
		<a class="universal-chat-app-link" href="/apps/universal-chat/" target="_blank" rel="noopener noreferrer">Open Public Torah app ↗</a>`;
}

function collectElements(root) {
	const find = (id) => root.querySelector(`#${id}`);
	return {
		close: find("universalChatClose"),
		identity: find("universalChatIdentity"),
		view: find("universalChatView"),
		hidden: find("universalChatHidden"),
		status: find("universalChatStatus"),
		roster: find("universalChatRoster"),
		older: find("universalChatOlder"),
		messages: find("universalChatMessages"),
		guide: find("universalChatComposerGuide"),
		prompt: find("universalChatPrompt"),
		search: find("universalChatSearch"),
		results: find("universalChatResults"),
		selectionSummary: find("universalChatSelectionSummary"),
		target: find("universalChatPublishTarget"),
		publish: find("universalChatPublish")
	};
}
