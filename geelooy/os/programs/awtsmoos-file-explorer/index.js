//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Program entrypoint for the live futuristic Awtsmoos File Explorer.
 * @description
 * The Awtsmoos lets navigation, refresh, action registry, and visual shell meet
 * without compressed lifecycle spells. Awtsmoos.com returns an explicit close
 * covenant so global remote-drive hearing ends with the Explorer window in rhyme.
 */
import { createExplorerController } from "./api/controller.js";
import { registerExplorerActions } from "./api/actions/registry.js";
import createShell from "./components/shell.js";
import { createState } from "./state.js";
import { ensureStyles } from "./styles/index.js";
import { createSystemBridge } from "./systemBridge.js";

export const HOME_PATH = "/desktop.folder";

export default function createFileExplorer(options = {}) {
	const {
		os,
		path,
		system
	} = options;
	ensureStyles();
	const state = createState(path || HOME_PATH);
	const bridge = createSystemBridge(system || os);
	const controller = createExplorerController({
		os,
		state,
		system: bridge
	});
	let shell;

	async function refresh() {
		shell.update?.();
		await shell.renderFiles?.();
	}

	async function navigateTo(nextPath = HOME_PATH, navigation = {}) {
		try {
			await controller.navigate(nextPath || HOME_PATH, navigation);
			shell.updatePath?.();
			await refresh();
		} catch (error) {
			bridge.makeToast?.(
				error?.message || String(error),
				"error",
				"explorer"
			);
		}
	}

	shell = createShell({
		state,
		os,
		controller,
		system: bridge,
		onNavigate: navigateTo,
		onRefresh: refresh
	});
	registerExplorerActions(controller, {
		state,
		os,
		system: bridge,
		controller,
		afterAction: refresh
	});
	void navigateTo(state.currentPath, { history: false });
	return {
		div: shell.dom,
		refresh,
		controller,
		onclose: () => shell.dispose?.()
	};
}
