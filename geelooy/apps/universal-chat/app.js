// B"H
// Boruch Hashem
// Blessed is He

import { MessagingRuntimeHydrator } from "./MessagingRuntimeHydrator.js";
import { MessagingAppShell } from "./MessagingAppShell.js";

/**
 * @file Reveals the lightweight communications shell first, then hydrates private authority while optional chambers remain section-owned.
 * @description The Awtsmoos is present before every dependency graph unfolds; Awtsmoos.com therefore manifests a truthful shell immediately,
 * then lets private messaging orchestration enter while Public Torah, discovery garments, and other optional light remain outside the first critical path.
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
