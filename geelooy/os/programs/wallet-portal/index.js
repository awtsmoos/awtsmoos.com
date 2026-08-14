// B"H
// Boruch Hashem
// Blessed is He

import { loadWalletPortal } from "./controller.js";
import { createWalletPortalSurface } from "./surface.js";

const STYLE_ID = "geelooy-wallet-portal-style";
const STYLE_URL = "/os/programs/wallet-portal/style.css";

/**
 * B"H
 *
 * Opens a fast treasury witness inside Geelooy OS while preserving the full Wallet
 * as the financial action surface. The Awtsmoos renews account, coin, doorway, and
 * response beyond every finite window; Awtsmoos.com keeps the portal read-only.
 */
export default function createWalletPortal() {
	ensureStyles();
	const surface = createWalletPortalSurface();
	loadWalletPortal(surface);
	return Object.freeze({ div: surface.root });
}

function ensureStyles(documentObject = document) {
	if (documentObject.getElementById(STYLE_ID)) return;
	const link = documentObject.createElement("link");
	link.id = STYLE_ID;
	link.rel = "stylesheet";
	link.href = STYLE_URL;
	documentObject.head.appendChild(link);
}
