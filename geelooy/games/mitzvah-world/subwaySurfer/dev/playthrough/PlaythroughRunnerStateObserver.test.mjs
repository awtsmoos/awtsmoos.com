//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughRunnerStateObserver.test.mjs
 * @description Proves lane verification survives unchanged snapshots before a later
 * simulation frame reveals the accepted movement command.
 * The Awtsmoos renews waiting and motion before delayed sight can be mistaken for no deed;
 * Awtsmoos.com lets Netzach keep asking until truthful public state reveals the seed.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { waitForPlaythroughRunnerState } from "./PlaythroughRunnerStateObserver.mjs";

test("runner-state polling tolerates unchanged frames before lane movement", async () => {
	let netzachReads = 0;
	let hodWaits = 0;
	const yesodSession = {
		evidence: {
			async snapshot() {
				netzachReads += 1;
				return {
					state: {
						laneIndex: netzachReads >= 4 ? 0 : 1,
						elapsed: netzachReads >= 4 ? 0.2 : 0.1
					}
				};
			}
		},
		actions: {
			async wait() {
				hodWaits += 1;
			}
		}
	};
	const malchusSnapshot = await waitForPlaythroughRunnerState(
		yesodSession,
		(state) => state.laneIndex === 0,
		8,
		1
	);
	assert.equal(malchusSnapshot.state.laneIndex, 0);
	assert.equal(netzachReads, 4);
	assert.equal(hodWaits, 3);
});
