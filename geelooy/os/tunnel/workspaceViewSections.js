// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Focused DOM section builders for the Geelooy OS Tunnel Workspace.
 * @description
 * The Awtsmoos gives peer consent, mount, files, command, and receipt-history their
 * own visible vessels. Awtsmoos.com names the Virtual OS and browser-tab transport
 * separately, then gives session, remember, stop, and forget their own explicit doors.
 */

export function workspaceHeader(doc) {
	const node = element(doc, "header");
	node.innerHTML = `
		<div>
			<p>B&quot;H · Remote workspace</p>
			<h2>Tunnel Workspace</h2>
			<p>Mount a verified route for files and native commands.</p>
		</div>
		<button type="button" data-workspace-close aria-label="Close Tunnel Workspace">×</button>`;
	return node;
}

export function peerSection(doc) {
	const section = element(doc, "section", "awt-os-tunnel-peer");
	section.innerHTML = `
		<h3>Virtual OS browser peer</h3>
		<p>Logical vessel: <strong>Virtual OS</strong> · transport: browser tab · no native shell authority.</p>
		<p data-peer-status aria-live="polite">Checking browser peer state…</p>
		<div class="awt-os-tunnel-actions">
			<button type="button" data-peer-session>Enable for this session</button>
			<button type="button" data-peer-remember>Enable + remember</button>
			<button type="button" data-peer-stop>Stop now</button>
			<button type="button" data-peer-forget>Forget remembered permission</button>
		</div>`;
	return section;
}

export function targetSection(doc) {
	const section = element(doc, "section", "awt-os-tunnel-target");
	section.innerHTML = `
		<h3>Mounted target</h3>
		<label>Verified vessel<select data-target-select></select></label>
		<div class="awt-os-tunnel-actions">
			<button type="button" data-target-refresh>Refresh targets</button>
			<button type="button" data-open-drive>Open mounted drive in Files</button>
		</div>
		<code class="awt-os-tunnel-route" data-target-route>No route selected</code>
		<label>Working directory<input data-target-cwd value="." spellcheck="false"></label>`;
	return section;
}

export function fileSection(doc) {
	const section = element(doc, "section", "awt-os-tunnel-grid");
	section.innerHTML = `
		<div>
			<h3>Remote files</h3>
			<div class="awt-os-tunnel-files" data-target-files><p>Select a target.</p></div>
		</div>
		<div>
			<h3>File preview</h3>
			<pre class="awt-os-tunnel-preview" data-target-preview>Open a text file to read it here.</pre>
		</div>`;
	return section;
}

export function commandSection(doc) {
	const section = element(doc, "section", "awt-os-tunnel-command");
	section.innerHTML = `
		<h3>Manual command</h3>
		<p>Commands run only through the selected command-capable tunnel.</p>
		<textarea data-command-input placeholder="pwd"></textarea>
		<div class="awt-os-tunnel-actions">
			<button type="button" data-command-run>Run once</button>
			<button type="button" data-command-cancel disabled>Cancel job</button>
		</div>
		<p class="awt-os-tunnel-status" data-command-status>Idle</p>
		<pre class="awt-os-tunnel-output" data-command-output>No command output yet.</pre>`;
	return section;
}

export function historySection(doc) {
	const section = element(doc, "section", "awt-os-tunnel-history");
	section.innerHTML = `
		<h3>Recent command receipts</h3>
		<p>Metadata only; command output is not persisted.</p>
		<div data-command-history></div>`;
	return section;
}

export function element(doc, tag, className = "", text = "") {
	const node = doc.createElement(tag);
	node.className = className;
	if (text) {
		node.textContent = text;
	}
	return node;
}
