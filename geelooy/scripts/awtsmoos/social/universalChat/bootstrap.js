// B"H
// Boruch Hashem
// Blessed is He

import { RealtimeUniversalChatSocket } from "./RealtimeUniversalChatSocket.js";
import { UniversalChatController } from "./UniversalChatController.js";
import { UniversalChatLauncher } from "./UniversalChatLauncher.js";
import { UniversalChatShell } from "./UniversalChatShell.js";
import { resolveUniversalChatContext } from "./contextResolver.js";

/**
 * @file Mounts one idempotent Universal Torah-chat session and re-adopts the actual route context whenever that singleton is reused.
 * @description The Awtsmoos renews header, Space, game, post, and dedicated app around one transport where public and private covenants stay distinct;
 * Awtsmoos.com keeps source-only public speech visible everywhere while the second style garment follows the current canonical room.
 */

const INSTANCE_KEY = "__awtsmoosUniversalChat";
const STYLE_ROOT = "/scripts/awtsmoos/social/universalChat/";
const STYLE_VERSION = "universal-chat-003";

/**
 * B"H batch 49 (user order 2026-11-13, top priority) — the "0 online"
 * pill is REMOVED from reader post pages, not hidden. The batch-48 CSS
 * hide rule did not apply (the pill stayed visible in every phone
 * screenshot, overlapping the title, the text, and the Explore search
 * field), so the render path itself is cut: on a reader post page the
 * launcher button is never created and never appended to the DOM.
 * The chat itself (shell, socket, controller, presence) still mounts,
 * so the social/chat feature is untouched everywhere else; only the
 * launcher doorway is skipped, and only on reader post pages.
 * A reader post page is the page whose first paint carries the reader's
 * own .post-reader-localized-context marker (present before this
 * deferred module runs), with the /heichelos/…/post/ URL as a fallback.
 */
function isReaderPostPage() {
	try {
		if (document.querySelector('.post-reader-localized-context')) return true;
		const path = (typeof location !== 'undefined' && location.pathname) || '';
		return /\/heichelos\/[^/]+\/series\/[^/]+\/post\//.test(path);
	} catch (_) {
		return false;
	}
}

/**
 * A launcher-shaped stand-in for reader post pages: it satisfies the
 * presence projection's setConnected/updateCount calls (and the private
 * unread update) without ever creating or appending a button, so the
 * pill is absent from the DOM. button is null — revealExpanded guards
 * it — and mount() is a no-op, so adoptOptions stays safe.
 */
function createReaderPostNoOpLauncher() {
	return {
		button: null,
		setConnected() {},
		updateCount() {},
		updateUnread() {},
		mount() {}
	};
}

/** Creates or reuses the page's one Universal Chat session. */
export function mountUniversalChat(options = {}) {
	installStyles();
	const existing = window[INSTANCE_KEY];
	if (existing) {
		adoptOptions(existing, options);
		mountPrivateBridge();
		return existing;
	}
	const shell = new UniversalChatShell();
	const launcher = isReaderPostPage()
		? createReaderPostNoOpLauncher()
		: new UniversalChatLauncher({
			mount: options.mount,
			onOpen: () => shell.open()
		});
	const socket = new RealtimeUniversalChatSocket();
	const controller = new UniversalChatController({
		socket,
		context: resolveUniversalChatContext(),
		shell,
		launcher
	});
	const instance = { socket, shell, launcher, controller };
	window[INSTANCE_KEY] = instance;
	adoptOptions(instance, options);
	controller.start();
	mountPrivateBridge();
	return instance;
}

/** Applies later mounting options and current route context to the existing singleton. */
function adoptOptions(instance, options) {
	adoptContext(instance);
	if (options.mount) {
		instance.launcher.mount(options.mount);
	}
	if (options.expanded) {
		revealExpanded(instance, options.container);
	}
}

/** Moves feed and presence into the route's current bounded context without creating another socket. */
function adoptContext(instance) {
	const nextContext = resolveUniversalChatContext();
	if (instance.controller.context.id === nextContext.id) {
		return;
	}
	instance.controller.context = nextContext;
	instance.controller.feed.context = nextContext;
	instance.controller.presence.context = nextContext;
	if (instance.controller.presence.started) {
		instance.controller.presence.enter().catch(() => {});
	}
}

/** Loads the split Universal Chat stylesheets once. */
function installStyles() {
	for (const name of ["panel.css", "messages.css"]) {
		if (document.querySelector(`link[data-universal-chat-style="${name}"]`)) {
			continue;
		}
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = `${STYLE_ROOT}${name}?v=${STYLE_VERSION}`;
		link.dataset.universalChatStyle = name;
		document.head.appendChild(link);
	}
}

/** Converts the reusable drawer into a contained dedicated-app presentation. */
function revealExpanded(instance, container) {
	if (instance.launcher.button) instance.launcher.button.hidden = true;
	instance.shell.root.classList.add("is-expanded");
	if (container) {
		container.appendChild(instance.shell.root);
	}
	instance.shell.open();
}

/** Loads only the lightweight verified private-request/index bridge on ordinary pages. */
function mountPrivateBridge() {
	import("../privateMessaging/bootstrap.js")
		.then(module => module.mountPrivateMessagingBridge())
		.catch(() => {});
}
