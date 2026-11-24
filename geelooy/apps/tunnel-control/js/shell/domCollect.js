// B"H — The Awtsmoos gives each workspace its living controls.
import { h } from "../ui/core/html.js";
import { PAGE_SPECS } from "./pageSpecs.js";
import { createMeshPanel } from "../runtime/mesh/meshPanel.js";
import { createRemoteDesktopPanel } from "../features/remoteDesktopPanel.js";
import { createSpeakerPanel } from "../features/speakerPanel.js";

/** Return the original app root without disturbing its identity. */
export function findAppRoot() {
	return document.querySelector("main, #app, .app, .wrap, .container") || document.body;
}

/** The Awtsmoos protects shell roots from being moved into their children. */
function unsafe(node) {
	return !node || node.closest(".awt-control-shell") ||
		node.matches("html, body, main, #app, .app, .wrap, .container");
}

/** Preserve a field's label, help and control as one vessel. */
function blockFor(node) {
	const wrapper = node.closest(".field, .form-row, .control-row, .toolbar, .actions, details, label, .card, .panel");
	return !unsafe(wrapper) && !wrapper.querySelector?.(".awt-control-shell") ? wrapper : node;
}

/** Never move a control twice. */
function moveUnique(destination, node, moved) {
	if (unsafe(node) || moved.has(node)) return false;
	// Run 08: never tear a block out of a panel that was already adopted as a
	// unit, and never swallow an adopted block into a later container. The
	// codex field labels live inside #actionDetail; listing their ids in the
	// pane spec used to rip them out of the detail card (and swap the codex
	// copies with the AI-agents copies, which share the same ids).
	for (const prior of moved) {
		if (prior.contains(node) || node.contains(prior)) return false;
	}
	moved.add(node);
	destination.append(node);
	return true;
}

/** Adopt every ID, class, and selector declared by the page. */
function adoptControls(destination, spec, moved) {
	let count = 0;
	for (const id of spec.ids || []) {
		const node = document.getElementById(id);
		if (node && moveUnique(destination, blockFor(node), moved)) count++;
	}
	for (const cls of spec.classes || []) {
		for (const node of [...document.getElementsByClassName(cls)]) {
			if (moveUnique(destination, blockFor(node), moved)) count++;
		}
	}
	for (const selector of spec.selectors || []) {
		for (const node of [...document.querySelectorAll(selector)]) {
			if (moveUnique(destination, blockFor(node), moved)) count++;
		}
	}
	return count;
}

/** Keep the human's published documentation links accessible. */
function docsLinks(spec) {
	return h("div", { classes: ["awt-link-grid"], children: (spec.links || []).map(url =>
		h("a", { attrs: { href: url, target: "_blank", rel: "noopener" }, text: url })) });
}

function commandCard(label, command) {
	const copy = h("button", { attrs: { type: "button" }, text: "Copy" });
	copy.addEventListener("click", () => navigator.clipboard.writeText(command));
	return h("div", { classes: ["awt-command-card"], children: [
		h("strong", { text: label }), h("pre", { text: command }), copy
	] });
}

function installCommands() {
	const values = [
		["PowerShell", "irm https://awtsmoos.com/api/tunnel/install/windows | iex"],
		["CMD", 'powershell -ExecutionPolicy Bypass -Command "irm https://awtsmoos.com/api/tunnel/install/windows | iex"'],
		["Mac / Linux", "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"]
	];
	return h("div", { classes: ["awt-command-grid"], children: values.map(
		([label, command]) => commandCard(label, command)) });
}

/** Generated pages with no source selectors must still be born. */
function bornPanel(spec) {
	if (spec.key === "mesh") return createMeshPanel();
	if (spec.key === "remoteDesktop") return createRemoteDesktopPanel();
	if (spec.key === "speaker") return createSpeakerPanel();
	if (typeof spec.create === "function" && ![
		...(spec.ids || []), ...(spec.classes || []), ...(spec.selectors || [])
	].length) return spec.create();
	return null;
}

function emptyPanel() {
	return h("div", { classes: ["awt-empty-dashboard"], children: [
		h("strong", { text: "Controls not found" }),
		h("span", { text: "The original controls for this page were not detected in the DOM." })
	] });
}

/** Every page receives adopted controls, a generated panel, or a clear warning. */
function createPane(spec, moved) {
	const body = h("div", { classes: ["awt-pane-content"] });
	const count = adoptControls(body, spec, moved);
	const created = bornPanel(spec);
	if (created) body.append(created);
	if (spec.commandPage) body.append(installCommands());
	if (spec.links) body.append(docsLinks(spec));
	if (!count && !created && !spec.commandPage && !spec.links) body.append(emptyPanel());
	return h("section", { attrs: { "data-pane": spec.key }, classes: ["awt-made-pane"], children: [body] });
}

export function collectPanes() {
	const moved = new Set();
	return PAGE_SPECS.map(spec => createPane(spec, moved));
}

export function createFallbackPane() {
	return h("section", { attrs: { "data-pane": "diagnostic" }, children: [
		h("div", { classes: ["awt-pane-content"], children: [
			h("strong", { text: "Diagnostic" }), h("span", { text: "No controls were detected." })
		] })
	] });
}
