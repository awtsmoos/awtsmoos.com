//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One while finite DOM vessels give four day periods their buttons, summaries, and signs;
 * Awtsmoos.com constructs only presentation shells here, leaving state and calculation untouched so each module keeps its proper lines.
 */

/** Build local Expand/Collapse controls for the complete-day period vessels. */
export function renderGroupToolbar() {
	const toolbar = document.createElement("div");
	toolbar.className = "zman-group-toolbar";
	toolbar.innerHTML = `
		<span>Day periods</span>
		<span class="zman-group-actions">
			<button type="button" data-zman-group-action="expand">Expand all</button>
			<button type="button" data-zman-group-action="collapse">Collapse all</button>
		</span>`;
	return toolbar;
}

/** Build one semantic group shell while leaving card insertion and event ownership to the grid. */
export function renderGroupShell(group, open, count, hasNext) {
	const details = document.createElement("details");
	details.className = "zman-group";
	details.dataset.group = group.id;
	details.open = open;
	const summary = document.createElement("summary");
	summary.className = "zman-group-summary";
	const live = hasNext ? "<b>Next</b>" : "";
	summary.innerHTML = `
		<span><strong>${group.label}</strong><small>${count} times</small></span>
		${live}
		<i aria-hidden="true">＋</i>`;
	const body = document.createElement("div");
	body.className = "zman-group-body zman-card-grid";
	details.append(summary, body);
	return { details, body };
}

/** Build one compact status badge for only exceptional card states. */
export function renderZmanStatus(text) {
	const badge = document.createElement("span");
	badge.className = "zman-status";
	badge.textContent = text;
	return badge;
}
