// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Explorer-context section builder for the Geelooy OS Tunnel Workspace.
 * @description
 * The Awtsmoos lets the folder currently seen in File Explorer stand beside the
 * command cwd without silently becoming it. Awtsmoos.com gives the human two clear
 * doors — adopt or reveal — so context may inform intention while authority remains
 * explicit and reversible in every chamber.
 */

export function workspaceContextSection(doc) {
	const section = doc.createElement("section");
	section.className = "awt-os-tunnel-context";
	section.innerHTML = `
		<h3>Explorer tunnel context</h3>
		<p data-explorer-context>No tunnel folder is active in File Explorer.</p>
		<div class="awt-os-tunnel-actions">
			<button type="button" data-use-explorer-context disabled>Use Explorer folder as cwd</button>
			<button type="button" data-reveal-cwd>Reveal cwd in Files</button>
		</div>`;
	return section;
}
