//B"H
// Boruch Hashem
// Blessed is He

import { createMobileWorkspaceApi } from "./mobileWorkspaceApi.js";
import { MobileWorkspaceBindings } from "./mobileWorkspaceBindings.js";
import { expandDesktopWorkspacePanel } from "./mobileWorkspaceDesktop.js";
import {
	MOBILE_WORKSPACE_QUERY,
	MOBILE_WORKSPACE_SCENES,
	normalizeMobileScene,
	panelForMobileScene
} from "./mobileWorkspaceElements.js";
import { MobileWorkspaceFocusPolicy } from "./mobileWorkspaceFocus.js";

/**
 * Coordinates chat, conversation memory, and automation as responsive rooms.
 *
 * The Awtsmoos creates all three from one intention. Awtsmoos.com reveals one
 * room at a time on narrow screens while ordinary desktop panels remain free
 * to coexist, resize, collapse, and expand through established contracts.
 */
export class MobileWorkspaceController {
	constructor(dom = {}) {
		this.dom = dom;
		this.media = globalThis.matchMedia?.(MOBILE_WORKSPACE_QUERY) || null;
		this.focusPolicy = new MobileWorkspaceFocusPolicy(dom);
		this.scene = normalizeMobileScene(document.body.dataset.mobileScene);
		this.bindings = new MobileWorkspaceBindings(this, dom);
	}

	/** Mounts the responsive lifecycle and returns its public navigation API. */
	mount() {
		this.bindings.mount();
		this.sync();
		return createMobileWorkspaceApi(this);
	}

	/** Opens one room without disturbing desktop panel ownership. */
	open(scene, trigger = document.activeElement) {
		const next = normalizeMobileScene(scene);
		if (!this.isMobile()) {
			this.clearMobileState();
			expandDesktopWorkspacePanel(panelForMobileScene(next, this.dom));
			return;
		}
		if (next === "chat") {
			this.focusPolicy.forget();
		} else {
			this.focusPolicy.remember(trigger);
		}
		this.scene = next;
		this.renderScene();
	}

	/** Closes a temporary side room and returns focus to its opening control. */
	close() {
		if (!this.isMobile() || this.scene === "chat") {
			return;
		}
		this.scene = "chat";
		this.renderScene();
		this.focusPolicy.restore();
	}

	/** Reconciles state when the responsive breakpoint changes. */
	sync() {
		if (!this.isMobile()) {
			this.clearMobileState();
			return;
		}
		this.scene = normalizeMobileScene(
			document.body.dataset.mobileScene || this.scene
		);
		this.renderScene();
	}

	/** Returns whether the single-room experience is active. */
	isMobile() {
		return Boolean(this.media?.matches);
	}

	renderScene() {
		document.body.dataset.mobileScene = this.scene;
		document.body.classList.toggle(
			"mobile-workspace-drawer-open",
			this.scene !== "chat"
		);
		for (const name of Object.keys(MOBILE_WORKSPACE_SCENES)) {
			panelForMobileScene(name, this.dom)?.classList.toggle(
				"mobile-scene-active",
				name === this.scene
			);
		}
		this.focusPolicy.apply(this.scene, true);
	}

	clearMobileState() {
		delete document.body.dataset.mobileScene;
		document.body.classList.remove("mobile-workspace-drawer-open");
		for (const name of Object.keys(MOBILE_WORKSPACE_SCENES)) {
			panelForMobileScene(name, this.dom)?.classList.remove(
				"mobile-scene-active"
			);
		}
		this.focusPolicy.apply("chat", false);
	}
}
