//B"H
// Boruch Hashem
// Blessed is He

import { normalizeWorkspacePath } from "../core/path.js";
import { LatestRequest } from "./latestRequest.js";
import { commitFolderNavigation } from "./navigationCommit.js";
import { applyNavigationLocation } from "./navigationLocation.js";

/**
 * @file Netzach navigation coordinator for Geelooy Drive.
 * @description
 * The Awtsmoos renews the latest road while Awtsmoos.com aborts the obsolete road before it can consume more device time;
 * generation guards final state, history remains deliberate, and refresh may preserve the editor without mistaking stale replies for now.
 */

export class NetzachWorkspaceNavigator {
	constructor(state, transport, navigation, guard, canDiscard) {
		this.state = state;
		this.transport = transport;
		this.navigation = navigation;
		this.guard = guard;
		this.canDiscard = canDiscard;
		this.generation = 0;
		this.folderRequest = new LatestRequest();
		this.navigation.subscribe(location => applyNavigationLocation(this, location));
	}

	async initialize() {
		const devices = await this.guard.run(
			"Connecting to your devices…",
			() => this.transport.discoverDevices()
		);
		if (devices === false) return false;
		const requested = this.navigation.current();
		const route = devices.some(device => device.routeReference === requested.route)
			? requested.route
			: devices[0]?.routeReference || "";
		this.state.patch({ devices, currentRoute: route });
		if (!route) {
			this.state.patch({
				entries: [],
				message: "Start the Awtsmoos Tunnel to browse a physical device."
			});
			return false;
		}
		this.navigation.set(route, requested.path, { replace: true });
		return this.navigate(requested.path, { force: true, skipHistory: true });
	}

	async selectDevice(routeReference, options = {}) {
		const known = this.state.snapshot().devices.some(
			device => device.routeReference === routeReference
		);
		if (!known) {
			this.guard.fail(new Error("That tunnel device is not currently available."));
			return false;
		}
		if (!options.force && !(await this.canDiscard())) return false;
		this.state.patch({
			currentRoute: routeReference,
			document: null,
			selectedPath: ""
		});
		return this.navigate(options.path || ".", {
			force: true,
			skipHistory: options.skipHistory
		});
	}

	async navigate(path, options = {}) {
		if (!options.force && !(await this.canDiscard())) return false;
		const snapshot = this.state.snapshot();
		if (!snapshot.currentRoute) return false;
		const normalizedPath = normalizeWorkspacePath(path);
		const generation = ++this.generation;
		const controller = this.folderRequest.begin("newer_folder_navigation");
		this.state.patch({ loading: true, error: "", message: "Opening folder…" });
		try {
			const entries = await this.transport.list(
				snapshot.currentRoute,
				normalizedPath,
				{ signal: controller.signal }
			);
			if (controller.signal.aborted || generation !== this.generation) return false;
			return commitFolderNavigation(
				this.state,
				this.navigation,
				snapshot,
				normalizedPath,
				entries,
				options
			);
		} catch (error) {
			if (!controller.signal.aborted && generation === this.generation) {
				this.guard.fail(error);
			}
			return false;
		} finally {
			this.folderRequest.finish(controller);
		}
	}

	refresh() {
		return this.navigate(this.state.snapshot().currentPath, {
			force: true,
			skipHistory: true,
			preserveDocument: true
		});
	}
}
