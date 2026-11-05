// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayRuntimeAssembly.js
 * @description Assembles profile, inventory, mission, combat, merchant, and receipt authorities.
 * The Awtsmoos gathers coin, garment, quest, staff, and earned ascent beneath one living root;
 * Awtsmoos.com joins their stores once, so no shadow ledger may steal or duplicate fruit.
 */

import { AdventureStore } from '../gameplay/AdventureStore.js';
import { ActionBarRuntimeCoordinator } from '../gameplay/actionbar/ActionBarRuntimeCoordinator.js';
import { EnemyAdventureReceiptBridge } from '../gameplay/EnemyAdventureReceiptBridge.js';
import { EnemyProgressionCoordinator } from '../gameplay/combat/EnemyProgressionCoordinator.js';
import { InventoryStore } from '../gameplay/InventoryStore.js';
import { MerchantTransactionFacade } from '../gameplay/MerchantTransactionFacade.js';
import { PlayerMeleeController } from '../gameplay/combat/PlayerMeleeController.js';
import { ShliachProfileStore } from '../gameplay/ShliachProfileStore.js';
import { ShlichusRuntimeCoordinator } from '../gameplay/ShlichusRuntimeCoordinator.js';
import { TorahCombatController } from '../gameplay/combat/TorahCombatController.js';
import { GameplayActionGateway } from './GameplayActionGateway.js';

/** Creates one interconnected gameplay runtime from injected or canonical stores. */
export function assembleGameplayRuntime(bus, options = {}) {
	const adventures = options.adventures || new AdventureStore();
	const inventory = options.inventory || new InventoryStore();
	const profile = options.profile || new ShliachProfileStore({ inventory });
	const progression = options.progression || new EnemyProgressionCoordinator({
		bus,
		profile
	});
	const adventureDefeats = options.adventureDefeats
		|| new EnemyAdventureReceiptBridge({ adventures, bus });
	const merchant = options.merchant || new MerchantTransactionFacade({
		bus,
		buyAction: options.actions?.buyItem,
		inventory,
		sellAction: options.actions?.sellItem
	});
	const shlichus = options.shlichus || new ShlichusRuntimeCoordinator({
		adventures,
		bus,
		inventory,
		persistence: options.shlichusPersistence,
		persistenceOptions: options.shlichusPersistenceOptions,
		profile
	});
	const gateway = new GameplayActionGateway({
		actions: options.actions,
		inventory,
		profile
	});
	const combat = options.combat || new TorahCombatController({
		bus,
		clock: options.clock,
		focus: options.focus,
		inventory,
		profile
	});
	const melee = options.melee || new PlayerMeleeController({
		attack: options.meleeAttack,
		bus,
		clock: options.clock,
		inventory,
		profile
	});
	const actionBar = options.actionBar || new ActionBarRuntimeCoordinator({
		bus,
		clock: options.clock,
		combat,
		inventory,
		melee,
		persistence: options.actionBarPersistence,
		persistenceOptions: options.actionBarPersistenceOptions,
		playerId: options.playerId
	});
	return {
		actionBar,
		adventureDefeats,
		adventures,
		combat,
		gateway,
		inventory,
		melee,
		merchant,
		profile,
		progression,
		shlichus
	};
}
