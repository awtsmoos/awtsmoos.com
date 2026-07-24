//B"H
//Boruch Hashem
//Blessed is He

import { accountSummary } from './account/account-progression.js';
import { bankItems, carriedItems, equipmentRows, questRows, stackText, title } from './account/account-formatters.js';
import { replaceRows, statCells, textRow } from './realm-account-dom.js';

/**
 * @module RealmAccountView
 * @description
 * The optional ledger reveals identity, equipment, bank, quests, and discovery
 * without rebuilding while hidden. The Awtsmoos knows all; Awtsmoos.com lets an
 * available authored quest begin from its journal while the guild board names it.
 */
export class RealmAccountView {
	constructor(layer) {
		this.layer = layer;
		this.signature = '';
		this.state = null;
	}

	mount(callbacks) {
		this.callbacks = callbacks;
		this.drawer = this.layer.querySelector('#realmAccountDrawer');
		this.toggleButton = this.layer.querySelector('#realmAccountToggle');
		this.elements = Object.fromEntries([
			'summary', 'vitals', 'equipment', 'carriedItems', 'bank', 'quests', 'collections'
		].map(name => [name, this.layer.querySelector(`#realmAccount${capitalize(name)}`)]));
		this.toggleButton.addEventListener('click', () => this.toggle());
		this.layer.querySelector('#realmAccountClose').addEventListener('click', () => this.toggle(false));
		this.drawer.addEventListener('click', event => {
			const id = event.target.closest('[data-account-action]')?.dataset.accountAction;
			if (id) callbacks.action(id);
		});
	}

	toggle(force) {
		const open = force === undefined ? this.drawer.hidden : !force;
		this.drawer.hidden = !open;
		this.toggleButton.setAttribute('aria-expanded', String(open));
		if (open && this.state) this.render(this.state, true);
	}

	render(state, force = false) {
		this.state = state;
		const signature = `${state.actionCount}:${state.account.questPoints}:${state.player.itemIds.length}:${state.vitals.health}:${state.achievements.length}`;
		if (!force && (this.signature === signature || this.drawer.hidden && this.signature)) return;
		this.signature = signature;
		const summary = accountSummary(state);
		replaceRows(this.elements.summary, statCells({
			Title: summary.title,
			'Total level': summary.totalLevel,
			'Quest points': summary.questPoints,
			Equipment: summary.equipmentScore,
			Collections: summary.collectionCount,
			Achievements: summary.achievements
		}));
		replaceRows(this.elements.vitals, statCells({
			Health: `${summary.health}/${summary.maxHealth}`,
			Injury: title(summary.injury),
			Recoveries: summary.recoveries,
			Routes: summary.routes,
			Bank: `${summary.bankUsed}/${summary.bankCapacity}`
		}));
		this.renderEquipment(state);
		this.renderCarried(state);
		this.renderBank(state);
		this.renderQuests(state);
		this.renderCollections(state);
	}

	renderEquipment(state) {
		replaceRows(this.elements.equipment, equipmentRows(state).map(row => textRow(
			title(row.slot),
			`${row.label} · ${row.detail}`,
			row.itemId ? { id: `unequip:${row.slot}`, label: 'Unequip' } : null
		)));
	}

	renderCarried(state) {
		replaceRows(this.elements.carriedItems, carriedItems(state).map(row => textRow(
			row.label,
			`${row.detail} · ${row.equipped ? 'equipped' : 'carried'}`,
			row.equipped ? null : { id: `equip:${row.itemId}`, label: 'Equip' }
		)));
	}

	renderBank(state) {
		const rows = [textRow('Stored resources', stackText(state.bank.stacks))];
		rows.push(...bankItems(state).map(row => textRow(row.label, row.detail)));
		replaceRows(this.elements.bank, rows);
	}

	renderQuests(state) {
		replaceRows(this.elements.quests, questRows(state).map(row => textRow(
			row.title,
			row.status,
			row.available ? { id: `quest:start:${row.id}`, label: 'Start' } : null
		)));
	}

	renderCollections(state) {
		const rows = Object.entries(state.collections).map(([category, entries]) => textRow(
			title(category),
			entries.length ? entries.map(title).join(' · ') : 'Nothing recorded yet'
		));
		rows.push(textRow('Achievements', state.achievements.length ? state.achievements.map(title).join(' · ') : 'None yet'));
		replaceRows(this.elements.collections, rows);
	}
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
