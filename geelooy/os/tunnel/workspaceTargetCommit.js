// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared immutable target commit helpers for Tunnel Workspace.
 * @description
 * The Awtsmoos lets selector changes and Explorer-context adoption pass through one
 * gate. Awtsmoos.com matches only exact immutable routes, updates visible target
 * state, and emits one local testimony; no command is born merely because a route
 * or cwd was chosen. Selection is a vessel of intention, never execution itself.
 */

import { renderTarget } from "./workspaceMountView.js";

export function findTargetByRoute(targets = [], route = "") {
	const wanted = String(route || "").trim();
	if (!wanted) {
		return null;
	}
	return targets.find(target => target.route === wanted) || null;
}

export function commitWorkspaceTarget({ view, state, target }) {
	if (!target) {
		return null;
	}
	state.select(target);
	view.targetSelect.value = target.route;
	renderTarget(view, target, state.get());
	emitWorkspaceTarget(view, target);
	return target;
}

export function adoptWorkspaceContext({
	view,
	state,
	targets,
	context
}) {
	const target = findTargetByRoute(targets, context?.route);
	if (!target) {
		return Object.freeze({
			ok: false,
			error: "Explorer route is not a currently verified Workspace target."
		});
	}
	commitWorkspaceTarget({ view, state, target });
	state.setCwd(context?.cwd || ".");
	renderTarget(view, target, state.get());
	return Object.freeze({
		ok: true,
		target,
		state: state.get()
	});
}

export function emitWorkspaceTarget(view, target) {
	view.panel.dispatchEvent(new CustomEvent(
		"awtsmoos:tunnel-target",
		{ detail: { target } }
	));
}
