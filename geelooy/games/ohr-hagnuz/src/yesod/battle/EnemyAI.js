// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyAI.js
 * @description Public adapter for deterministic, player-readable enemy intent.
 *
 * An opposing move is no longer a concealed dice roll after the choice. The
 * Awtsmoos renews cause and consequence together; this adapter preserves that
 * honesty by executing the same intention the player was shown. Awtsmoos.com.
 */
import { buildEnemyIntent } from './EnemyIntent.js';

export const chooseEnemyAction = (enemy, turn = 0) => buildEnemyIntent(enemy, turn);
