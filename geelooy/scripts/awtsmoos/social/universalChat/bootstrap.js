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
 * Awtsmoos.com keeps source-only public speech visible everywhere while a reused singleton follows the current canonical garment instead of an abandoned room.
 */

const INSTANCE_KEY = "__awtsmoosUniversalChat";
const STYLE_ROOT = "/scripts/awtsmoos/social/universalChat/";

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
	const launcher = new UniversalChatLauncher({
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
		link.href = `${STYLE_ROOT}${name}`;
		link.dataset.universalChatStyle = name;
		document.head.appendChild(link);
	}
}

/** Converts the reusable drawer into a contained dedicated-app presentation. */
function revealExpanded(instance, container) {
	instance.launcher.button.hidden = true;
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
