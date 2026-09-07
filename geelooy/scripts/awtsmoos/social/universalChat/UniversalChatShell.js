// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the universal Torah discussion chamber while rendering, history, search, and transport live in smaller vessels.
 * @description The Awtsmoos renews source, presence, privacy, and discussion before one finite control can appear;
 * Awtsmoos.com keeps the public chamber compact enough for a phone while search remains private and only deliberately selected Torah cards may enter public sight.
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

	/** Opens explanatory details on wider canvases without turning viewport shape into durable preference. */
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
			<label class="universal-chat-view-control"><span>Feed</span><select id="universalChatView" aria-label="Public Torah feed"><option value="channel">This page</option><option value="site">Across Awtsmoos</option></select></label>
			<label class="universal-chat-privacy-control">
				<input class="universal-chat-privacy-input" id="universalChatHidden" type="checkbox" aria-label="Hide me from the public online count">
				<span class="universal-chat-privacy-switch" aria-hidden="true"></span>
				<span class="universal-chat-privacy-label">Hide me</span>
			</label>
		</div>
		<div id="universalChatStatus" class="universal-chat-status" role="status" aria-live="polite"></div>
		<div id="universalChatRoster" class="universal-chat-roster"></div>
		<button id="universalChatOlder" class="universal-chat-older" type="button" hidden>Load older source posts</button>
		<div id="universalChatMessages" class="universal-chat-messages" aria-live="polite"></div>
		<section class="universal-chat-composer" aria-labelledby="universalChatComposerTitle">
			<div class="universal-chat-composer-intro">
				<strong id="universalChatComposerTitle">Add Torah sources</strong>
				<details id="universalChatComposerGuide" class="universal-chat-composer-guide">
					<summary>How source-only publishing works</summary>
					<small>Your search stays private. Only server-issued source cards you deliberately select can be published.</small>
				</details>
			</div>
			<label for="universalChatPrompt">Search by idea, phrase, or topic</label>
			<div class="universal-chat-search-row">
				<input id="universalChatPrompt" maxlength="500" autocomplete="off" placeholder="Search Torah…">
				<button id="universalChatSearch" type="button">Search</button>
			</div>
			<div id="universalChatResults" class="universal-chat-results"></div>
			<div id="universalChatSelectionSummary" class="universal-chat-selection-summary" aria-live="polite"></div>
			<div class="universal-chat-publish-row">
				<select id="universalChatPublishTarget" aria-label="Publish destination"><option value="context">Publish to this page</option><option value="global">Publish across Awtsmoos</option></select>
				<button id="universalChatPublish" type="button" disabled>Publish sources</button>
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
