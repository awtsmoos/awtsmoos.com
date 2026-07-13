// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWickProgress.js
 * @description Owns durable start, discovery, restoration, trade, and completion transitions.
 *
 * A road becomes real through remembered transitions. The Awtsmoos renews every
 * fiber and promise; this vessel keeps the lamp-house story coherent while its
 * travel remains free to breathe elsewhere on Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { RETURN_LOST_WICK } from '../../content/companions/ReturnLostWick.js';
import { openShop } from '../../yesod/economy/ShopRuntime.js';
import { grantBond } from '../../yesod/party/PartyRuntime.js';
import { applyReturnLostWickConsequences } from './ReturnLostWickConsequences.js';
import { discoveredTraceCount } from './CompanionShlichusState.js';
import { enterReturnLostWickRoad } from './ReturnLostWickTravel.js';

function remember(entry) {
	State.Missions.history ||= [];
	State.Missions.history.unshift({
		...entry,
		missionId: RETURN_LOST_WICK.id,
		at: Date.now()
	});
}

export function beginReturnLostWick(lead) {
	lead.status = 'active';
	lead.stage = 'traces';
	lead.startedAt ||= Date.now();
	lead.objective = 'Search the concealed marsh for three wick traces.';
	remember({ type: 'COMPANION_SHLICHUS_STARTED', target: 'nerel' });
	return enterReturnLostWickRoad('Lantern Sense parts the reeds and reveals a forgotten road.');
}

export function discoverReturnLostWickTrace(lead, trace) {
	if (lead.discoveredTraces[trace.id]) {
		State.say(`${trace.label} already rests safely in Nerel's lantern.`, 320);
		return true;
	}
	lead.discoveredTraces[trace.id] = true;
	lead.traceOrder.push(trace.id);
	const count = discoveredTraceCount(lead);
	lead.stage = count === RETURN_LOST_WICK.traces.length ? 'repair' : 'traces';
	lead.objective = lead.stage === 'repair'
		? 'Bring the reunited wick to the ruined lamp.'
		: `Find the remaining wick traces (${count}/${RETURN_LOST_WICK.traces.length}).`;
	remember({ type: 'WICK_TRACE_FOUND', target: trace.id, order: lead.traceOrder.length });
	State.say(`${trace.line} Wick trace ${count}/${RETURN_LOST_WICK.traces.length}.`, 520);
	return true;
}

export function restoreReturnLostWickLamp(lead) {
	const count = discoveredTraceCount(lead);
	if (count < RETURN_LOST_WICK.traces.length) {
		State.say(`The lamp waits. ${RETURN_LOST_WICK.traces.length - count} trace remains concealed.`, 420);
		return true;
	}
	if (State.WorldState.flags[RETURN_LOST_WICK.flags.lampRestored]) {
		State.say('The lamp burns steadily, turning rain into a ring of gold.', 360);
		return true;
	}
	State.WorldState.flags[RETURN_LOST_WICK.flags.lampRestored] = true;
	State.WorldState.flags[RETURN_LOST_WICK.flags.conversationUnlocked] = true;
	State.WorldState.flags[RETURN_LOST_WICK.flags.veilWeakened] = true;
	lead.status = 'restored';
	lead.stage = 'merchant';
	lead.objective = 'Speak with the merchant who returned to the illuminated road.';
	const baseBond = grantBond('nerel', 'shlichus');
	const result = applyReturnLostWickConsequences(lead);
	remember({ type: 'LAMP_HOUSE_RESTORED', target: 'bent-reeds-lamp', approach: result.approach.id });
	const bonus = result.bonusBond ? ` Additional bond +${result.bonusBond.amount}.` : '';
	State.say(`${RETURN_LOST_WICK.conversation.join(' ')} ${result.approach.line} Nerel bond +${baseBond.amount}.${bonus}`, 1200);
	return true;
}

export function completeReturnLostWickRoad(lead) {
	if (!State.WorldState.flags[RETURN_LOST_WICK.flags.lampRestored]) {
		State.say('The merchant points toward the dark lamp-house and does not unpack.', 360);
		return true;
	}
	State.WorldState.flags[RETURN_LOST_WICK.flags.tradeRestored] = true;
	if (lead.status !== 'completed') {
		lead.status = 'completed';
		lead.stage = 'completed';
		lead.completedAt = Date.now();
		lead.conversationViewed = true;
		lead.objective = lead.consequences.line;
		remember({ type: 'COMPANION_SHLICHUS_COMPLETED', target: 'nerel', approach: lead.approachId });
	}
	State.say(`Taliah returns. ${lead.consequences.line}`, 760);
	openShop('merchant_exchange');
	return true;
}
