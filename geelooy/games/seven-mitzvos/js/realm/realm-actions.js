//B"H
//Boruch Hashem
//Blessed is He

import { DurabilityService } from './account/durability-service.js';
import { QuestService } from './account/quest-service.js';

/**
 * @module RealmActions
 * @description
 * Actions arise from place, person, project, inventory, account, story, and danger.
 * The Awtsmoos joins deed and consequence; Awtsmoos.com reuses bounded services so
 * the four-hertz interface does not repeatedly allocate account engines.
 */
const durability = new DurabilityService();
const quests = new QuestService();

export function realmActions(state, context) {
	const actions = [];
	if (context.resource) actions.push(action(`gather:${context.resource.resource}`, `Gather ${context.resource.resource}`));
	if (context.npc) actions.push(action(`talk:${context.npc.record.id}`, `Speak with ${context.npc.record.name}`));
	const landmark = context.landmark?.id;
	if (landmark === 'fountain') actions.push(action('gather:water', 'Fill water vessel'));
	if (landmark === 'workshop') workshopActions(state, actions);
	if (landmark === 'bridge') bridgeActions(state, actions);
	if (landmark === 'market') marketActions(state, actions);
	if (landmark === 'home' || landmark === 'bank') homeActions(state, actions);
	if (landmark === 'court') actions.push(action('investigate:records', 'Review public records'));
	if (landmark === 'sanctuary') sanctuaryActions(state, actions);
	if (landmark === 'questBoard') questActions(state, actions);
	if (landmark === 'roadGate') roadActions(state, actions);
	if (state.event) {
		for (const response of state.event.actions) {
			actions.unshift(action(`event:${response}`, eventLabel(response)));
		}
	}
	if (!actions.length) actions.push(action('observe', 'Observe surroundings'));
	return actions.slice(0, 8);
}

function workshopActions(state, actions) {
	actions.push(action('craft:timber', 'Craft timber'));
	actions.push(action('craft:medicine', 'Prepare medicine'));
	actions.push(action('craft:food', 'Bake food'));
	const damaged = durability.lowestDamaged(state);
	if (damaged) actions.push(action(`repair:${damaged.id}`, 'Repair most worn item'));
}

function bridgeActions(state, actions) {
	actions.push(action('bridge:timber', 'Add timber'));
	actions.push(action('bridge:stone', 'Set stone'));
	if (state.travel.unlocked.includes('river-ferry')) {
		actions.push(action('travel:river-ferry', 'Take river ferry'));
	}
}

function marketActions(state, actions) {
	actions.push(action('trade:sell:wood', 'Sell wood'));
	actions.push(action('trade:sell:timber', 'Sell timber'));
	actions.push(action('trade:buy:medicine', 'Buy medicine'));
	actions.push(action('trade:buy:grain', 'Buy grain'));
	if (state.travel.unlocked.includes('market-cart')) {
		actions.push(action('travel:market-cart', 'Ride market cart'));
	}
}

function homeActions(state, actions) {
	actions.push(action('home:upgrade', 'Upgrade workshop'));
	actions.push(action('home:recover', state.vitals.downed ? 'Recover and reclaim cache' : 'Rest to full health'));
	actions.push(action('bank:deposit:coin', 'Bank 1 coin'));
	if (state.bank.stacks.coin) actions.push(action('bank:withdraw:coin', 'Withdraw 1 coin'));
	const equipped = new Set(Object.values(state.equipment).filter(Boolean));
	const carried = state.player.itemIds.find(id => !equipped.has(id));
	if (carried) actions.push(action(`bankItem:deposit:${carried}`, 'Bank carried equipment'));
	if (state.bank.itemIds[0]) actions.push(action(`bankItem:withdraw:${state.bank.itemIds[0]}`, 'Withdraw banked equipment'));
}

function sanctuaryActions(state, actions) {
	actions.push(action('care:animals', 'Assist animal care'));
	if (state.travel.unlocked.includes('sanctuary-path')) {
		actions.push(action('travel:sanctuary-path', 'Use sanctuary path'));
	}
}

function questActions(state, actions) {
	for (const quest of quests.available(state).slice(0, 3)) {
		actions.push(action(`quest:start:${quest.id}`, `Start: ${quest.title}`));
	}
}

function roadActions(state, actions) {
	if (state.encounter.roadThreat.active) {
		actions.push(action('encounter:negotiate', 'Negotiate road peace'));
		actions.push(action('encounter:restrain', 'Nonlethal restraint'));
		actions.push(action('encounter:retreat', 'Mark danger and retreat'));
	} else if (state.travel.unlocked.includes('north-road')) {
		actions.push(action('travel:north-road', 'Use north road'));
	}
}

function action(id, label) {
	return { id, label, disabled: false };
}

function eventLabel(id) {
	return {
		search: 'Search riverbank', medicine: 'Use medicine', water: 'Carry water',
		organize: 'Organize responders', grain: 'Release grain',
		negotiate: 'Negotiate supply', calm: 'Calm the animal'
	}[id] || id;
}
