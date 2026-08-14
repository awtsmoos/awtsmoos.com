//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the present while tests pin one artificial instant for a measured view;
 * Awtsmoos.com proves passed, next, upcoming, and selected-date states remain honest and true.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildDayStatus } from "../js/domain/day-status.js";

function fixtureTimes() {
	return {
		alos: new Date("2026-08-13T08:00:00Z"),
		misheyakir: new Date("2026-08-13T09:00:00Z"),
		sunrise: new Date("2026-08-13T10:00:00Z"),
		sofShema: new Date("2026-08-13T13:00:00Z"),
		sofTefillah: new Date("2026-08-13T14:00:00Z"),
		sofAchilasChametz: new Date("2026-08-13T14:00:00Z"),
		sofBiur: new Date("2026-08-13T15:00:00Z"),
		chatzos: new Date("2026-08-13T16:00:00Z"),
		minchaGedola: new Date("2026-08-13T16:30:00Z"),
		minchaKetana: new Date("2026-08-13T19:30:00Z"),
		plag: new Date("2026-08-13T20:45:00Z"),
		candleLighting: new Date("2026-08-13T23:30:00Z"),
		sunset: new Date("2026-08-13T23:48:00Z"),
		tzeis: new Date("2026-08-14T00:20:00Z"),
		shabbosEnd: new Date("2026-08-14T00:40:00Z"),
		rabbeinuTam72: new Date("2026-08-14T01:00:00Z"),
		chatzosHalailah: new Date("2026-08-14T04:00:00Z")
	};
}

test("today status identifies passed, next and upcoming zmanim", () => {
	const now = new Date("2026-08-13T12:30:00Z");
	const status = buildDayStatus(
		"2026-08-13",
		"America/New_York",
		fixtureTimes(),
		now
	);
	assert.equal(status.isToday, true);
	assert.equal(status.statusById.sunrise, "passed");
	assert.equal(status.next.id, "sofShema");
	assert.equal(status.statusById.sofShema, "next");
	assert.equal(status.statusById.chatzos, "upcoming");
	assert.ok(status.progress > 0);
	assert.ok(status.progress < 1);
});

test("non-today selection suppresses live countdown semantics", () => {
	const status = buildDayStatus(
		"2026-08-14",
		"America/New_York",
		fixtureTimes(),
		new Date("2026-08-13T12:30:00Z")
	);
	assert.equal(status.isToday, false);
	assert.equal(status.next, null);
	assert.equal(status.progress, null);
	assert.equal(status.statusById.sunrise, "selected-date");
});
