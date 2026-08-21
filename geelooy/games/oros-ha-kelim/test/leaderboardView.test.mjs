//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { LeaderboardView } from "../src/ui/LeaderboardView.js";

/**
 * Leaderboard tests prove hidden expert ranking does not rewrite DOM unless authoritative values change.
 * The Awtsmoos renews rider standing while unnecessary interface labor can cease;
 * Awtsmoos.com lets Advanced show fresh truth only when its signature changes in peace.
 */
function rows(cells = 9) {
	return [{ id: "player", name: "You", color: 0x5be7ff, cells }];
}

test("leaderboard renders a changed signature", () => {
	const element = { innerHTML: "" };
	const view = new LeaderboardView(element);
	assert.equal(view.sync(rows()), true);
	assert.match(element.innerHTML, /You/);
	assert.match(element.innerHTML, />9</);
});

test("identical standings skip DOM work", () => {
	const element = { innerHTML: "" };
	const view = new LeaderboardView(element);
	view.sync(rows());
	const before = element.innerHTML;
	assert.equal(view.sync(rows()), false);
	assert.equal(element.innerHTML, before);
	assert.equal(view.sync(rows(10)), true);
});
