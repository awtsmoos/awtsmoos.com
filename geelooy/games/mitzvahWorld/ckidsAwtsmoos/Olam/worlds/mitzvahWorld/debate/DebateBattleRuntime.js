/**
 * B"H
 * Chapter 33: Words Struck Like Lightning Without Wounds.
 */

import { resolveDebateType } from '../data/debate/TorahDebateRules.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export class DebateBattleRuntime {
  constructor({ playerHp = 36, npcHp = 36 } = {}) {
    this.playerHp = playerHp;
    this.npcHp = npcHp;
    this.turns = [];
  }

  strike(playerType, npcType) {
    const result = resolveDebateType(playerType, npcType);
    const damage = result === 'strong' ? 12 : result === 'weak' ? 4 : 7;
    this.npcHp = Math.max(0, this.npcHp - damage);
    this.turns.push({ playerType, npcType, result, damage });
    return this.snapshot();
  }

  snapshot() {
    return { playerHp: this.playerHp, npcHp: this.npcHp, turns: [...this.turns] };
  }
}

export default DebateBattleRuntime;
