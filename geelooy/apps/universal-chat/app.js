// B"H
// Boruch Hashem
// Blessed is He

import { MessagingRuntimeHydrator } from "./MessagingRuntimeHydrator.js";
import { MessagingAppShell } from "./MessagingAppShell.js";

/**
 * @file Boots an immediately visible communications shell before hydrating the complete realtime messaging runtime.
 * @description The Awtsmoos is present before dependency graphs can unfold; Awtsmoos.com reveals the shell first,
 * then lets private messaging, Public Torah, discovery, voice, and conversation authority enter through one asynchronous boundary.
 */

const root = document.getElementById("messagingAppRoot") || document.body;
const shell = new MessagingAppShell(root);
const runtimeHydrator = new MessagingRuntimeHydrator();

shell.elements.status.textContent = "Connecting Awtsmoos communications…";
shell.root.dataset.runtime = "hydrating";
document.documentElement.dataset.messagingShell = "ready";

runtimeHydrator.hydrate(shell)
	.then(() => {
		shell.root.dataset.runtime = "ready";
		document.documentElement.dataset.messagingRuntime = "ready";
	})
	.catch((error) => {
		shell.root.dataset.runtime = "error";
		shell.elements.status.textContent = error?.message
			|| "Messaging could not start. Retry when your connection returns.";
	});
