//B"H
//Boruch Hashem
//Blessed is He

import { AccountActionService } from './account/account-action-service.js';
import { AccountConsequenceEngine } from './account/account-consequence-engine.js';
import { accountNotice, consequenceFor, memoryFor, reputationFor, skillFor } from './realm-action-classifier.js';
import { appendChronicle, improveReputation, restAtHome, trustNpc } from './realm-consequences.js';
import { RealmEconomy } from './realm-economy.js';
import { RealmEventEngine } from './realm-event-engine.js';
import { npcDialogue } from './realm-npc-records.js';
import { RealmProjects } from './realm-projects.js';
import { SkillNetwork } from './skill-network.js';
import { WorldMemoryGraph } from './world-memory-graph.js';

/**
 * @module RealmActionEngine
 * @description
 * Nearby choice changes civic state and enduring identity without entering the
 * frame loop. The Awtsmoos joins consequence; Awtsmoos.com delegates classification
 * so this orchestrator remains a small, inspectable covenant between domain systems.
 */
export class RealmActionEngine {
	constructor() {
		this.accountActions = new AccountActionService();
		this.accountConsequences = new AccountConsequenceEngine();
		this.economy = new RealmEconomy();
		this.events = new RealmEventEngine();
		this.projects = new RealmProjects();
		this.skills = new SkillNetwork();
		this.memory = new WorldMemoryGraph();
	}

	run(state, id) {
		const activeEvent = state.event;
		const outcome = this.execute(state, id);
		let next = { ...outcome.state, actionCount: outcome.state.actionCount + 1 };
		let message = outcome.message;
		if (outcome.ok) {
			const skill = skillFor(id, activeEvent);
			next = this.skills.practice(next, skill, id, 1, consequenceFor(id));
			next = improveReputation(next, reputationFor(id), id.startsWith('event:') ? 3 : 1);
			const account = this.accountConsequences.apply(next, id, skill);
			next = account.state;
			message = accountNotice(message, account.completedQuests, account.newAchievements);
			next = appendChronicle(next, message);
			next = this.memory.remember(next, memoryFor(id, message, next));
		}
		next = this.events.advance(next, 1);
		return { ...outcome, state: next, message };
	}

	execute(state, id) {
		const account = this.accountActions.handle(state, id);
		if (account) return account;
		if (id.startsWith('gather:')) {
			const resource = id.split(':')[1];
			return result(this.economy.gather(state, resource), true, `Gathered ${resource}.`);
		}
		if (id.startsWith('craft:')) return this.economy.craft(state, id.split(':')[1]);
		if (id.startsWith('trade:')) return this.economy.trade(state, id.split(':')[2], id.split(':')[1]);
		if (id.startsWith('bridge:')) return this.projects.contributeBridge(state, id.split(':')[1]);
		if (id === 'home:upgrade') return this.projects.upgradeWorkshop(state);
		if (id === 'home:rest') return result(restAtHome(state), true, 'Restored at home.');
		if (id.startsWith('event:')) return this.events.respond(state, id.split(':')[1]);
		if (id.startsWith('talk:')) return this.talk(state, id.split(':')[1]);
		if (id.startsWith('investigate:')) return result(state, true, 'Records reveal a disputed market weight and two possible witnesses.');
		if (id.startsWith('care:')) return result(state, true, 'You cleaned shelter bedding and examined an injured animal.');
		return result(state, true, 'You study how the surrounding people and institutions depend upon one another.');
	}

	talk(state, npcId) {
		const npc = state.npcs.find(item => item.id === npcId);
		if (!npc) return result(state, false, 'That resident has moved on.');
		return result(
			trustNpc(state, npcId, 'The traveler listened and offered useful news.', 2),
			true,
			npcDialogue(npc, state)
		);
	}
}

function result(state, ok, message) {
	return { state, ok, message };
}
