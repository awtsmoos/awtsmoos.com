// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the reusable chess-room social panel without embedding server or media logic.
 * @description Malchus gives chat, presence, invitation, and video a visible vessel in light;
 * the Awtsmoos renews the people around the board, while Awtsmoos.com keeps the center right.
 */

/** Creates the chess social panel once and exposes its stable element contract. */
export class MalchusSocialShell {
	constructor() {
		this.root = document.createElement("aside");
		this.root.id = "chessSocialPanel";
		this.root.className = "chess-social-panel hidden";
		this.root.innerHTML = this.template();
		document.body.appendChild(this.root);
		this.elements = this.collectElements();
	}

	/** Returns the small HTML vessel; all dynamic user content later uses textContent. */
	template() {
		return `
			<div class="chess-social-header">
				<strong>Live Chess Room</strong>
				<button id="chessSocialCollapse" type="button" aria-label="Toggle social panel">−</button>
			</div>
			<div id="chessSocialBody" class="chess-social-body">
				<div id="chessSocialStatus" class="chess-social-status"></div>
				<div id="chessPresence" class="chess-presence"></div>
				<div class="chess-watch-row">
					<input id="chessWatchLink" type="text" readonly aria-label="Watch link">
					<button id="chessCopyWatch" type="button">Copy</button>
				</div>
				<div id="chessMediaGrid" class="chess-media-grid"></div>
				<button id="chessMediaToggle" type="button">Enable Camera + Mic</button>
				<div id="chessChatLog" class="chess-chat-log" aria-live="polite"></div>
				<form id="chessChatForm" class="chess-chat-form">
					<input id="chessChatInput" maxlength="500" autocomplete="off" placeholder="Public room chat">
					<button type="submit">Send</button>
				</form>
			</div>
		`;
	}

	/** Collects stable elements so behavior modules never repeatedly query the document. */
	collectElements() {
		return {
			body: this.root.querySelector("#chessSocialBody"),
			collapse: this.root.querySelector("#chessSocialCollapse"),
			status: this.root.querySelector("#chessSocialStatus"),
			presence: this.root.querySelector("#chessPresence"),
			watchLink: this.root.querySelector("#chessWatchLink"),
			copyWatch: this.root.querySelector("#chessCopyWatch"),
			mediaGrid: this.root.querySelector("#chessMediaGrid"),
			mediaToggle: this.root.querySelector("#chessMediaToggle"),
			chatLog: this.root.querySelector("#chessChatLog"),
			chatForm: this.root.querySelector("#chessChatForm"),
			chatInput: this.root.querySelector("#chessChatInput")
		};
	}

	/** Reveals the panel without affecting the centered chess-board layout. */
	show() {
		this.root.classList.remove("hidden");
	}

	/** Toggles only the panel body, preserving room state and media connections. */
	toggleCollapsed() {
		const collapsed = this.bodyIsHidden();
		this.elements.body.classList.toggle("hidden", !collapsed);
		this.elements.collapse.textContent = collapsed ? "−" : "+";
	}

	/** Reports whether the panel body is currently collapsed. */
	bodyIsHidden() {
		return this.elements.body.classList.contains("hidden");
	}
}
