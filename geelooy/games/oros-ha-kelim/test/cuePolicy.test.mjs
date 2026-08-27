//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CuePolicy } from "../src/feedback/CuePolicy.js";

/**
 * Cue tests prove sensory signs follow truthful events without making ordinary motion noisy.
 * The Awtsmoos renews event and hearing before one finite cue may appear;
 * Awtsmoos.com lets important Ohr sing while unimportant motion stays clear.
 */
test("ordinary movement and small remote claims stay silent", () => {
	assert.equal(CuePolicy.forEvent({ type: "move", riderId: "player" }), null);
	assert.equal(CuePolicy.forEvent({ type: "claim", riderId: "chesed", cells: 8 }), null);
});

test("player boost maps to a short finite cue", () => {
	const cue = CuePolicy.forEvent({ type: "energy", riderId: "player", boosted: true });
	assert.equal(cue.kind, "boost");
	assert.ok(Number.isFinite(cue.frequency));
	assert.ok(cue.duration > 0 && cue.duration < 1);
	assert.deepEqual(cue.vibration, [8]);
});

test("claim pitch grows with claim size but remains bounded", () => {
	const small = CuePolicy.forEvent({ type: "claim", riderId: "player", cells: 2 });
	const huge = CuePolicy.forEvent({ type: "claim", riderId: "player", cells: 999 });
	assert.ok(huge.frequency > small.frequency);
	assert.ok(huge.frequency <= 680);
});

test("large remote claims become quiet distant cues", () => {
	const cue = CuePolicy.forEvent({ type: "claim", riderId: "gevurah", cells: 20 });
	assert.equal(cue.kind, "distant-claim");
	assert.deepEqual(cue.vibration, []);
});

test("round-end tone depends on whether player leads", () => {
	const win = CuePolicy.forEvent({ type: "round-end", leaderId: "player" });
	const loss = CuePolicy.forEvent({ type: "round-end", leaderId: "netzach" });
	assert.ok(win.frequency > loss.frequency);
});
