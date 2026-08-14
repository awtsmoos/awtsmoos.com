// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Reads one account Wallet projection for the Geelooy doorway without duplicating
 * treasury mutation logic. The Awtsmoos renews account, balance, and visibility;
 * Awtsmoos.com keeps the portal read-only and leaves all sending/top-up actions to
 * the full guarded Wallet page.
 */

export async function loadWalletPortal(surface, fetchImpl = fetch) {
	try {
		const response = await fetchImpl("/api/wallet/balance", {
			credentials: "include",
			headers: { Accept: "application/json" }
		});
		const payload = await response.json();
		if (!payload?.ok || !payload.wallet) {
			renderSignedOut(surface, payload?.error || "Sign in to load your Wallet.");
			return;
		}
		const wallet = payload.wallet;
		setValue(surface, "total", `${wallet.balance} Perutahs`);
		setValue(surface, "promotional", `${wallet.promotionalBalance} Perutahs`);
		setValue(surface, "purchased", `${wallet.purchasedBalance} Perutahs`);
		surface.status.textContent = "Wallet loaded from the server-authoritative treasury.";
	} catch {
		renderSignedOut(surface, "Wallet summary could not be loaded. Open the full Wallet to retry.");
	}
}

function renderSignedOut(surface, message) {
	for (const key of ["total", "promotional", "purchased"]) {
		setValue(surface, key, "—");
	}
	surface.status.textContent = message;
}

function setValue(surface, key, value) {
	const element = surface.root.querySelector(`[data-wallet-value="${key}"]`);
	if (element) element.textContent = value;
}
