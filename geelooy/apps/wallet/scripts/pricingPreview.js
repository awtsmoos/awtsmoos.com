// B"H
// Boruch Hashem
// Blessed is He

import { getWalletJson } from "./client.js";
import {
	renderRatios,
	renderReferences
} from "./coinView.js";

/**
 * B"H
 *
 * Loads public server currency testimony for checkout preview and historical study.
 * The Awtsmoos renews cent, Perutah, source, and browser beyond every finite rate;
 * Awtsmoos.com keeps signed-out pricing useful without copying exchange constants
 * into client code or requiring account access just to understand the coin system.
 */

export async function bootPricingPreview() {
	const input = document.getElementById("dollars");
	const preview = document.getElementById("purchasePreview");
	const response = await getWalletJson("/api/wallet/currency");

	if (!response.ok) {
		if (preview) {
			preview.textContent = "Currency pricing is temporarily unavailable.";
		}
		return;
	}

	const pricing = response.pricing || {};
	applyInputLimits(input, pricing);
	renderPublicCurrencyStudy(response);
	updatePreview(input, preview, pricing);
	input?.addEventListener("input", () => {
		updatePreview(input, preview, pricing);
	});
}

function applyInputLimits(input, pricing) {
	if (!input) {
		return;
	}
	input.min = String(pricing.minimumTopUpDollars || 1);
	input.max = String(pricing.maximumTopUpDollars || 250);
}

function renderPublicCurrencyStudy(response) {
	renderRatios(
		document.getElementById("coinSystem"),
		response.automaticDenominations || []
	);
	renderReferences(
		document.getElementById("coinReferences"),
		response.referenceVariants || []
	);
}

function updatePreview(input, preview, pricing) {
	if (!input || !preview) {
		return;
	}
	const dollars = Number(input.value);
	const cents = Math.round(dollars * 100);
	const rate = Number(pricing.perutahsPerUsdCent) || 0;
	const perutahs = Math.max(0, cents * rate);
	const minimum = Number(pricing.minimumTopUpDollars) || 1;
	preview.textContent = Number.isFinite(dollars) && dollars >= minimum
		? `$${dollars.toFixed(2)} → ${perutahs.toLocaleString()} purchased Perutahs`
		: `Minimum top-up: $${minimum.toFixed(2)} · ${(minimum * 100 * rate).toLocaleString()} purchased Perutahs`;
}
