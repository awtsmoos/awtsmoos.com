// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWickRuntime.js
 * @description Routes the Wick road and lets its restored lamp open the next chapter.
 *
 * A completed road does not become dead scenery. The Awtsmoos renews conclusion
 * as the seed of another journey; this router lets the lamp-house remember what
 * happened and answer with a deeper call from Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { RETURN_LOST_WICK, isLampAt, isMerchantAt, traceAt } from '../../content/companions/ReturnLostWick.js';
import { leadMusag } from '../../yesod/party/PartyRuntime.js';
import { echoBeneathBentReedsSummary, handleEchoBeneathBentReedsAction } from './EchoBeneathBentReedsRuntime.js';
import { beginReturnLostWick, completeReturnLostWickRoad, discoverReturnLostWickTrace, restoreReturnLostWickLamp } from './ReturnLostWickProgress.js';
import { discoveredTraceCount, ensureReturnLostWickState, returnLostWickUnlocked } from './CompanionShlichusState.js';
import { enterReturnLostWickRoad, leaveReturnLostWickRoad } from './ReturnLostWickTravel.js';

function handleOverworldRoad(meta, lead) {
	const isEntryRoad = State.MapId === 'Overworld_Main' && meta.kind === 'road';
	if (!isEntryRoad || !returnLostWickUnlocked()) {
		return false;
	}
	if (leadMusag()?.id !== 'nerel' || lead.status === 'completed') {
		return false;
	}
	if (lead.status === 'unlocked') {
		return beginReturnLostWick(lead);
	}
	return enterReturnLostWickRoad('Lantern Sense remembers the unfinished lamp-house road.');
}

function handleLampHouseAction(front, meta, lead) {
	if (!lead || leadMusag()?.id !== 'nerel') {
		State.say('Lantern Sense is quiet. Make Nerel the lead companion.', 360);
		return true;
	}
	const trace = traceAt(front.x, front.y);
	if (trace) {
		return discoverReturnLostWickTrace(lead, trace);
	}
	if (isLampAt(front.x, front.y)) {
		return lead.status === 'completed'
			? handleEchoBeneathBentReedsAction(lead)
			: restoreReturnLostWickLamp(lead);
	}
	if (isMerchantAt(front.x, front.y)) {
		return completeReturnLostWickRoad(lead);
	}
	if (meta.kind === 'road' && lead.status === 'completed') {
		return leaveReturnLostWickRoad();
	}
	return false;
}

export function handleReturnLostWickAction(front = {}, meta = {}) {
	const lead = ensureReturnLostWickState();
	if (State.MapId !== RETURN_LOST_WICK.mapId) {
		return handleOverworldRoad(meta, lead);
	}
	return handleLampHouseAction(front, meta, lead);
}

export function returnLostWickSummary() {
	const lead = ensureReturnLostWickState();
	if (!lead) {
		return null;
	}
	return {
		...lead,
		traceCount: discoveredTraceCount(lead),
		totalTraces: RETURN_LOST_WICK.traces.length,
		echo: echoBeneathBentReedsSummary()
	};
}
