//B"H — Shabbos Mode time tests. Run: node tests/times.test.mjs
import { strict as assert } from "node:assert";
import { sunsetUTCms, getShabbosWindow } from "../times.mjs";

const JERUSALEM = { lat: 31.7683, lon: 35.2137 }; // UTC+3 (IDT) in October

// 1. Sunset on Friday 2026-10-09 in Jerusalem should be ~15:00 UTC (±60 min).
{
	const ms = sunsetUTCms(2026, 10, 9, JERUSALEM.lat, JERUSALEM.lon);
	const h = new Date(ms).getUTCHours() + new Date(ms).getUTCMinutes() / 60;
	assert.ok(h > 13.5 && h < 16.5, `sunset ${h} UTC out of expected range`);
	console.log("ok 1 - jerusalem friday sunset in range:", new Date(ms).toISOString());
}

// 2. Saturday 2026-10-10 10:00 UTC (13:00 IDT) is Shabbos.
{
	const w = getShabbosWindow({ ...JERUSALEM, now: new Date(Date.UTC(2026, 9, 10, 10, 0)), utcOffsetMin: 180 });
	assert.equal(w.inShabbos, true, "expected inShabbos on Saturday afternoon");
	assert.ok(w.candleLighting < w.havdalah, "candle lighting before havdalah");
	const gapMin = (w.candleLighting.getTime() - w.fridaySunset.getTime()) / 60000;
	assert.equal(Math.round(gapMin), -18, "candle lighting 18 min before sunset");
	const havGap = (w.havdalah.getTime() - w.saturdaySunset.getTime()) / 60000;
	assert.equal(Math.round(havGap), 50, "havdalah 50 min after saturday sunset");
	console.log("ok 2 - saturday afternoon is Shabbos; candle/havdalah offsets correct");
}

// 3. Friday 2026-10-09 07:00 UTC (10:00 IDT) is not yet Shabbos.
{
	const w = getShabbosWindow({ ...JERUSALEM, now: new Date(Date.UTC(2026, 9, 9, 7, 0)), utcOffsetMin: 180 });
	assert.equal(w.inShabbos, false, "expected not inShabbos Friday morning");
	assert.ok(w.minutesToShabbos > 300 && w.minutesToShabbos < 600, "minutesToShabbos sane");
	console.log("ok 3 - friday morning not Shabbos, minutesToShabbos =", Math.round(w.minutesToShabbos));
}

// 4. Sunday is not Shabbos.
{
	const w = getShabbosWindow({ ...JERUSALEM, now: new Date(Date.UTC(2026, 9, 11, 12, 0)), utcOffsetMin: 180 });
	assert.equal(w.inShabbos, false, "expected not inShabbos Sunday");
	console.log("ok 4 - sunday not Shabbos");
}

// 5. Custom candle lighting / havdalah respected.
{
	const w = getShabbosWindow({
		...JERUSALEM, now: new Date(Date.UTC(2026, 9, 10, 10, 0)), utcOffsetMin: 180,
		candleLightingMin: 40, havdalahMin: 72,
	});
	assert.equal(Math.round((w.candleLighting - w.fridaySunset) / 60000), -40);
	assert.equal(Math.round((w.havdalah - w.saturdaySunset) / 60000), 72);
	console.log("ok 5 - custom offsets respected");
}

// 6. New York winter Friday: sunset much earlier than Jerusalem summer sanity.
{
	const ms = sunsetUTCms(2026, 12, 11, 40.7128, -74.0060); // Friday Dec 11 2026
	const h = new Date(ms).getUTCHours() + new Date(ms).getUTCMinutes() / 60;
	assert.ok(h > 20.5 && h < 22.5, `nyc winter sunset ${h} UTC out of range`); // ~16:30 EST = 21:30 UTC
	console.log("ok 6 - nyc winter friday sunset in range:", new Date(ms).toISOString());
}

// 7. Invalid input throws.
{
	assert.throws(() => getShabbosWindow({ lat: "x", lon: 1, utcOffsetMin: 0 }), TypeError);
	console.log("ok 7 - invalid input throws TypeError");
}

console.log("\nAll times tests passed.");
