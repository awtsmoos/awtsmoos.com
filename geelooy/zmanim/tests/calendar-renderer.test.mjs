//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the calendar before module names, markup, or styles can make a claim;
 * Awtsmoos.com guards the renderer contract so a refactor cannot silently break the visible frame.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { BinahCalendarRenderer } from "../js/components/calendar-renderer.js";

/** Create the smallest ShadowRoot-shaped vessel needed by the pure renderer. */
function yesodShadowVessel() {
	return {
		innerHTML: ""
	};
}

test("calendar renderer composes styles and semantic month structure", () => {
	const shadowRoot = yesodShadowVessel();
	BinahCalendarRenderer.render(shadowRoot, "2026-08-20", "2026-08-20");

	assert.match(shadowRoot.innerHTML, /<style>/);
	assert.match(shadowRoot.innerHTML, /class="calendar"/);
	assert.match(shadowRoot.innerHTML, /class="calendar-header"/);
	assert.match(shadowRoot.innerHTML, /class="days"/);
	assert.match(shadowRoot.innerHTML, /data-month="-1"/);
	assert.match(shadowRoot.innerHTML, /data-month="1"/);
	assert.match(shadowRoot.innerHTML, /data-selected="true"/);
});

test("calendar day state attributes stay explicit and accessible", () => {
	const markup = BinahCalendarRenderer.dayButton(
		"2026-08-20",
		"2026-08-20",
		"2026-08-20",
		"2026-08-20"
	);

	assert.match(markup, /data-outside="false"/);
	assert.match(markup, /data-selected="true"/);
	assert.match(markup, /data-today="true"/);
	assert.match(markup, /aria-pressed="true"/);
	assert.match(markup, /aria-current="date"/);
});

test("outside-month dates remain selectable but visually identifiable", () => {
	const markup = BinahCalendarRenderer.dayButton(
		"2026-07-26",
		"2026-08-20",
		"2026-08-20",
		"2026-08-20"
	);

	assert.match(markup, /data-outside="true"/);
	assert.match(markup, /data-selected="false"/);
	assert.doesNotMatch(markup, /aria-current="date"/);
});
