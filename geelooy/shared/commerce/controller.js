// B"H
// Boruch Hashem
// Blessed is He

import { getCommerceJson, postCommerceJson } from "./client.js";
import { buildProductCommerceModel } from "./model.js";
import {
	createCommerceSurface,
	openCommerceDialog,
	closeCommerceDialog
} from "./surface.js";
import { renderCommerce, setCommerceBusy, setCommerceStatus } from "./render.js";
import { currentCommerceReturnPath, processCommerceReturn, shouldOpenCommerce } from "./return.js";
import {
	dispatchCommerceEvent,
	purchaseError,
	purchaseSuccess,
	retryKeyFor
} from "./purchaseUi.js";

/** Mounts lazy product commerce. No Wallet read occurs until the user opens it. */
export async function mountProductCommerce(identity) {
	const surface = createCommerceSurface(identity);
	const state = { loaded: false, retryKeys: new Map() };
	surface.launcher.addEventListener("click", () => void open(surface, state, identity));
	surface.dialog.addEventListener("click", event => void onDialogClick(event, surface, state, identity));
	const callback = await processCommerceReturn();
	if (callback.handled) {
		openCommerceDialog(surface);
		setCommerceStatus(surface, callback.message, callback.ok ? "success" : "error");
		await load(surface, state, identity);
	} else if (shouldOpenCommerce()) {
		await open(surface, state, identity);
	}
}

async function open(surface, state, identity) {
	openCommerceDialog(surface);
	dispatchCommerceEvent("open", { productId: identity.id });
	if (!state.loaded) await load(surface, state, identity);
}

async function load(surface, state, identity) {
	setCommerceBusy(surface, true);
	const [catalog, commerce, balance] = await Promise.all([
		getCommerceJson("/api/wallet/commerce/catalog"),
		getCommerceJson("/api/wallet/commerce/entitlements"),
		getCommerceJson("/api/wallet/balance")
	]);
	const model = buildProductCommerceModel(identity, catalog, commerce, balance);
	renderCommerce(surface, model, identity);
	state.model = model;
	state.loaded = catalog?.ok === true;
	if (!catalog.ok) setCommerceStatus(surface, "Store catalog is temporarily unavailable. Reopen to retry.", "error");
	setCommerceBusy(surface, false);
}

async function onDialogClick(event, surface, state, identity) {
	const close = event.target.closest("[data-commerce-close]");
	if (close) return closeCommerceDialog(surface);
	if (surface.root.dataset.busy === "true") return;
	const topup = event.target.closest("[data-commerce-topup]");
	if (topup && !state.model?.authenticated) {
		window.location.assign(`/login?next=${encodeURIComponent(currentCommerceReturnPath())}`);
		return;
	}
	if (topup) return startTopUp(Number(topup.dataset.commerceTopup), surface);
	const buy = event.target.closest("[data-commerce-sku]");
	if (!buy) return;
	if (!state.model?.authenticated) {
		window.location.assign(`/login?next=${encodeURIComponent(currentCommerceReturnPath())}`);
		return;
	}
	await purchase(buy.dataset.commerceSku, surface, state, identity);
}

async function purchase(skuId, surface, state, identity) {
	const retryKey = retryKeyFor(state, skuId);
	setCommerceBusy(surface, true);
	setCommerceStatus(surface, "Recording ownership with purchased Perutas…");
	const result = await postCommerceJson("/api/wallet/commerce/purchase", { skuId, idempotencyKey: retryKey });
	if (result.ok) {
		state.retryKeys.delete(skuId);
		state.loaded = false;
		setCommerceStatus(surface, purchaseSuccess(result), "success");
		await load(surface, state, identity);
		dispatchCommerceEvent("purchase", { skuId });
		return;
	}
	if (result.error !== "wallet_network_error") state.retryKeys.delete(skuId);
	setCommerceStatus(surface, purchaseError(result.error), "error");
	setCommerceBusy(surface, false);
}

async function startTopUp(dollars, surface) {
	setCommerceBusy(surface, true);
	setCommerceStatus(surface, `Creating a secure $${dollars.toFixed(2)} top-up…`);
	const result = await postCommerceJson("/api/wallet/paypal/create", {
		dollars,
		returnPath: currentCommerceReturnPath()
	});
	const approval = result.order?.links?.find(link => link.rel === "approve")?.href;
	if (result.ok && approval) {
		dispatchCommerceEvent("topup-start", { dollars });
		window.location.assign(approval);
		return;
	}
	setCommerceStatus(surface, `Could not start top-up: ${result.error || "provider unavailable"}`, "error");
	setCommerceBusy(surface, false);
}
