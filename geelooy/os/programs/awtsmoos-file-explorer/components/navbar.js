//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Explorer navigation header joining the command rail and path vessel.
 * @description
 * The Awtsmoos lets command and location become two faces of one file-world truth;
 * Awtsmoos.com keeps toolbar and path independently updateable while mobile may hide
 * the ladder and desktop may reveal it, all without changing navigation behavior in rhyme.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import createPathBar from "./pathBar.js";
import createToolbar from "./toolbar.js";

/**
 * Builds the Explorer header and exposes narrow update hooks for its two sub-vessels.
 *
 * @param {object} options Explorer state, OS, controller, and navigation callbacks.
 * @returns {{dom:HTMLElement,updatePath:Function,update:Function}} Navbar API.
 */
export default function createNavbar(options = {}) {
	const {
		state,
		os,
		controller,
		onNavigate,
		onRefresh,
		onToggleSidebar
	} = options;
	const header = createElement({
		tag: "div",
		attributes: {
			class: "file-explorer-header",
			"data-xp-frame": "raised",
			"data-button-surface": "explorer-navbar"
		}
	});
	const toolbar = createToolbar({
		state,
		os,
		controller,
		onRefresh,
		onToggleSidebar
	});
	const pathBar = createPathBar({
		state,
		onNavigate
	});
	header.append(toolbar.dom, pathBar.dom);
	return {
		dom: header,
		updatePath: pathBar.updatePath,
		update: toolbar.update
	};
}
