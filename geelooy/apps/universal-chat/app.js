// B"H
// Boruch Hashem
// Blessed is He

import {
	mountPrivateMessagingBridge
} from "/scripts/awtsmoos/social/privateMessaging/bootstrap.js";
import {
	mountUniversalChat
} from "/scripts/awtsmoos/social/universalChat/bootstrap.js";
import {
	MessagingAppController
} from "./MessagingAppController.js";
import {
	MessagingAppShell
} from "./MessagingAppShell.js";

/**
 * @file Boots the dedicated social messaging app around the same shared realtime/public/private clients used throughout the site.
 * @description The Awtsmoos renews one dedicated palace from the same universal socket already living in the header and games in light;
 * Awtsmoos.com composes private consent messaging beside source-only public Torah without forking identity, transport, or conversation sight.
 */

const root = document.getElementById("messagingAppRoot") || document.body;
const shell = new MessagingAppShell(root);
const bridge = mountPrivateMessagingBridge();
mountUniversalChat();
const controller = new MessagingAppController(shell, bridge);

controller.start().catch((error) => {
	shell.elements.status.textContent = error?.message
		|| "Messaging could not start.";
});
