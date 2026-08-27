// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Open, hidden, and recently closed tabs receive distinct visible chambers. The
 * Awtsmoos renews each lifecycle state; Awtsmoos.com names pinned and agent-owned
 * vessels so humans can recover old work without keeping every renderer awake.
 */
export function tabManagerMarkup(options = {}) {
	const openTabs = options.openTabs || [];
	const hiddenTabs = options.hiddenTabs || [];
	const closedTabs = options.closedTabs || [];
	return `
		<div class="tm-lifecycle-shell">
			<header class="tm-lifecycle-header">
				<div><p class="code-kicker">Tab lifecycle</p><h2>Open, hidden, and recently closed</h2></div>
				<button data-tm-close-overlay type="button" aria-label="Close tab manager">×</button>
			</header>
			${section("Open tabs", "Visible renderers and current automation targets", openTabs.map(openCard).join("") || empty("No open tabs."))}
			${section("Hidden tabs", "Sleeping tabs preserve state without remaining browser targets", hiddenTabs.map(hiddenCard).join("") || empty("No hidden tabs."))}
			${section("Recently closed", "Reopen the latest dissolved tabs", closedTabs.slice(0, 20).map(closedCard).join("") || empty("No recently closed tabs."))}
		</div>`;
}

function openCard(tab) {
	return card(tab, `
		<button data-tab-action="activate" data-tab-id="${tab.id}">Activate</button>
		<button data-tab-action="hide" data-tab-id="${tab.id}">Hide</button>
		<button data-tab-action="pin" data-tab-id="${tab.id}">${tab.pinned ? "Unpin" : "Pin"}</button>
		<button data-tab-action="close" data-tab-id="${tab.id}">Close</button>`);
}

function hiddenCard(tab) {
	return card(tab, `
		<button data-tab-action="restore" data-tab-id="${tab.id}">Restore</button>
		<button data-tab-action="pin" data-tab-id="${tab.id}">${tab.pinned ? "Unpin" : "Pin"}</button>`, "is-hidden");
}

function closedCard(tab, index) {
	const name = tab.item?.name || tab.title || "Untitled";
	return `<article class="tm-lifecycle-card is-closed">
		<div><strong>${escape(name)}</strong><small>${escape(tab.item?.path || "/")}</small></div>
		<div class="tm-lifecycle-actions"><button data-tab-action="reopen-index" data-closed-index="${index}">Reopen</button></div>
	</article>`;
}

function card(tab, actions, className = "") {
	const name = tab.item?.name || tab.title || "Untitled";
	const owner = tab.agentOwner || tab.item?.agentOwner || "";
	return `<article class="tm-lifecycle-card ${className} ${tab.pinned ? "is-pinned" : ""}">
		<div class="tm-lifecycle-card__identity">
			<strong>${escape(name)}</strong>
			<small>${escape(tab.item?.path || "/")}</small>
			${owner ? `<span>Agent: ${escape(owner)}</span>` : ""}
		</div>
		<div class="tm-lifecycle-actions">${actions}</div>
	</article>`;
}

function section(title, description, body) {
	return `<section class="tm-lifecycle-section"><header><h3>${escape(title)}</h3><p>${escape(description)}</p></header><div class="tm-lifecycle-grid">${body}</div></section>`;
}

function empty(text) {
	return `<p class="tm-lifecycle-empty">${escape(text)}</p>`;
}

function escape(value) {
	return String(value ?? "").replace(/[&<>"']/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;"
	})[character]);
}
