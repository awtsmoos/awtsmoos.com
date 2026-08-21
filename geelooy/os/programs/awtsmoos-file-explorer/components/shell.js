//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file File Explorer shell with window-scoped remote-drive reactivity.
 * @description
 * The Awtsmoos lets Explorer breathe while connected worlds arrive and depart;
 * Awtsmoos.com binds that breath to the visible shell lifetime, so shelf, sidebar,
 * selection, and listener all rise together and vanish together in rhyme.
 */
import createBreadcrumb from "./breadcrumb.js";
import createDriveShelf from "./driveShelf.js";
import createFileView from "./fileView.js";
import createNavbar from "./navbar.js";
import { subscribeRemoteDrives } from "./remoteDriveListener.js";
import createSelectionBar from "./selectionBar.js";
import createSidebar from "./sidebar.js";

export default function createShell(options = {}) {
	const {
		state,
		os,
		controller,
		system,
		onNavigate,
		onRefresh
	} = options;
	const root = div("file-explorer future-explorer xp-explorer");
	const frame = div("file-explorer-frame");
	const navbar = createNavbar({
		state,
		os,
		controller,
		onNavigate,
		onRefresh,
		onToggleSidebar: () => toggleSidebar(root)
	});
	const sidebar = createSidebar({ os, onNavigate });
	const shelf = normalizePart(createDriveShelf({ os, onNavigate }));
	const crumbs = createBreadcrumb({ state, controller });
	const selection = createSelectionBar({
		state,
		controller,
		os,
		onCancel: exitSelection
	});
	const view = createFileView({
		state,
		os,
		controller,
		system,
		onRefresh,
		onEnterSelectionMode: enterSelection,
		onExitSelectionMode: exitSelection
	});
	const main = div("file-explorer-main");
	const content = div("file-explorer-content");
	content.append(shelf.dom, crumbs, selection.dom, view.dom);
	main.append(sidebar.dom, content);
	frame.append(navbar.dom, main);
	root.append(frame);
	const unsubscribeRemotes = subscribeRemoteDrives(() => {
		sidebar.rebuild?.();
		sidebar.syncSelection?.(state.currentPath);
		shelf.update?.();
	});

	function update() {
		navbar.update?.();
		crumbs.awtsUpdate?.();
		selection.update?.();
		sidebar.syncSelection?.(state.currentPath);
		shelf.update?.();
		root.dataset.selectionMode = state.selectionMode ? "on" : "off";
		root.dataset.loading = state.loading ? "yes" : "no";
	}

	function updatePath() {
		navbar.updatePath?.();
		crumbs.awtsUpdate?.();
		sidebar.syncSelection?.(state.currentPath);
	}

	function enterSelection() {
		state.selectionMode = true;
		update();
	}

	function exitSelection() {
		state.selectionMode = false;
		controller.clearSelection();
		update();
	}

	function dispose() {
		unsubscribeRemotes();
	}

	return {
		dom: root,
		renderFiles: view.render,
		update,
		updatePath,
		dispose
	};
}

function toggleSidebar(root) {
	root.classList.toggle("sidebar-collapsed");
}

function normalizePart(part) {
	return part?.nodeType ? { dom: part } : part;
}

function div(className) {
	const node = document.createElement("div");
	node.className = className;
	return node;
}
