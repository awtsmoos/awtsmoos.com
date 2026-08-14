// B"H
// Boruch Hashem
// Blessed is He

import { createCoinStudySurface } from "./coinStudySurface.js";

/**
 * B"H
 *
 * Mounts only the secondary Wallet testimony that deserves persistent screen space.
 * The Awtsmoos renews refill, ledger, and historical study beyond each finite panel;
 * Awtsmoos.com keeps refill and recent movement visible while the deeper coin system
 * stays collapsed until the user asks, preventing scholarship from becoming clutter.
 */

export function mountWalletSecondary(
	mount = document.getElementById("secondaryMount")
) {
	if (!mount) {
		return;
	}
	mount.replaceChildren(
		createRefillLedgerGrid(),
		createCoinStudySurface()
	);
}

function createRefillLedgerGrid() {
	const grid = node("section", "grid");
	grid.append(createRefillPanel(), createLedgerPanel());
	return grid;
}

function createRefillPanel() {
	const panel = node("div", "panel");
	const meterBox = node("div", "meter-box");
	const meterLine = node("div", "meter-line");
	const meterValue = text("strong", "", "Loading…");
	meterValue.id = "meterValue";
	meterLine.append(text("span", "", "Promotional cap"), meterValue);

	const meter = node("div", "meter");
	meter.setAttribute("aria-hidden", "true");
	const meterFill = node("div");
	meterFill.id = "meterFill";
	meter.append(meterFill);
	const refillText = text("p", "", "Loading refill policy…");
	refillText.id = "refillText";
	meterBox.append(meterLine, meter, refillText);
	panel.append(
		text("p", "eyebrow", "Promotional refill"),
		text("h2", "", "Daily promotional recharge"),
		meterBox
	);
	return panel;
}

function createLedgerPanel() {
	const panel = node("div", "panel");
	const ledger = node("div");
	ledger.id = "ledger";
	ledger.setAttribute("aria-live", "polite");
	panel.append(
		text("p", "eyebrow", "Ledger"),
		text("h2", "", "Recent movement"),
		ledger
	);
	return panel;
}

function node(tagName, className = "") {
	const element = document.createElement(tagName);
	element.className = className;
	return element;
}

function text(tagName, className, value) {
	const element = node(tagName, className);
	element.textContent = value;
	return element;
}
