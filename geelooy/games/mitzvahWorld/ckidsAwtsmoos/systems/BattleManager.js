/**
 * B"H
 * @file BattleManager.js  
 * @description THE MASTER BATTLE ORCHESTRATOR — Torah Debate System
 * Integrates BattleCanvas, PaRDeS progression, and type effectiveness.
 */

import BattleCanvas from '../Olam/uiManager/ui/BattleCanvas.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { buildBattleMove, getPassageStats } from './PassageLevel.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { TYPE_CHART } from '../tochen/torah/books/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { STARTER_PASSAGES } from '../tochen/torah/books/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class BattleManager {
    constructor(olam) {
        this.olam       = olam;
        this.active     = false;
        this.canvas     = new BattleCanvas(olam.gameContainer || document.body);
        this.canvas.mount();

        this._state = {
            playerPassages: [], opponentPassages: [],
            playerHp: 100, opponentHp: 100,
            turn: 'player', madreiga: 1, perutahs: 0
        };
    }

    /**
     * @function initiate — Starts a battle with opponent NPC or Kelipa
     */
    initiate(opponent) {
        if (this.active) return;
        this.active = true;

        const player = this.olam.chossid;
        const madreiga = player?.madreiga ?? 1;
        const passages = player?.passages ?? STARTER_PASSAGES;

        this._state = {
            playerPassages: passages,
            opponentPassages: this._generateOpponentMoves(opponent),
            playerHp:     player?.currentStats?.health ?? 100,
            playerMaxHp:  player?.currentStats?.health ?? 100,
            opponentHp:   opponent?.maxHp ?? 100,
            opponentMaxHp: opponent?.maxHp ?? 100,
            turn: 'player', madreiga, perutahs: 0,
            opponent, player
        };

        this.canvas.startBattle(player, opponent);
        this.olam.ayshPeula('ui event', 'showBattleUI', {
            passages: passages.map(p => buildBattleMove(p, madreiga)),
            state: this._state
        });
    }

    /**
     * @function playerAttack — Player uses a passage at their current PaRDeS level
     */
    playerAttack(passageIndex) {
        if (!this.active || this._state.turn !== 'player') return;
        const passage = this._state.playerPassages[passageIndex];
        if (!passage) return;

        const move = buildBattleMove(passage, this._state.madreiga);
        const damage = this._calcDamage(move, this._state.opponent);

        this._state.opponentHp = Math.max(0, this._state.opponentHp - damage);
        this.canvas.playMoveEffect(move, true);
        this.canvas._state.opponentHp = this._state.opponentHp;
        this.olam.ayshPeula('ui event', 'battleMsg', { message: `B"H! ${move.name} [${move.level.toUpperCase()}] dealt ${damage} damage!` });

        if (this._state.opponentHp <= 0) {
            this._victory();
            return;
        }
        this._state.turn = 'opponent';
        setTimeout(() => this._opponentTurn(), 1200);
    }

    _opponentTurn() {
        if (!this.active) return;
        const moves = this._state.opponentPassages;
        const move  = moves[Math.floor(Math.random() * moves.length)];
        const damage = Math.floor(move.power * 0.6 * (0.8 + Math.random() * 0.4));

        this._state.playerHp = Math.max(0, this._state.playerHp - damage);
        this.canvas.playMoveEffect(move, false);
        this.canvas._state.playerHp = this._state.playerHp;
        this.olam.ayshPeula('ui event', 'battleMsg', { message: `${this._state.opponent?.name} uses ${move.name}! ${damage} damage!` });

        if (this._state.playerHp <= 0) {
            this._defeat();
            return;
        }
        this._state.turn = 'player';
    }

    _victory() {
        const perutahs = 100 + Math.floor(this._state.opponentMaxHp * 2);
        const xp       = 150 + this._state.opponentMaxHp;
        this.olam.ayshPeula('reward', { perutahs, xp, source: 'battle_victory' });
        this.olam.ayshPeula('ui event', 'battleMsg', { message: `🏆 B"H! Victory! +${perutahs} Perutahs, +${xp} XP!` });
        setTimeout(() => this.endBattle(), 2500);
    }

    _defeat() {
        this.olam.ayshPeula('ui event', 'battleMsg', { message: '😔 You were defeated. Rise again with teshuvah!' });
        setTimeout(() => this.endBattle(), 2500);
    }

    endBattle() {
        this.active = false;
        this.canvas.endBattle();
        this.olam.ayshPeula('ui event', 'hideBattleUI');
    }

    _calcDamage(move, opponent) {
        const base = move.power;
        const typeChart = TYPE_CHART[move.damageType];
        let multiplier = 1;
        if (typeChart && opponent?.elementalType) {
            if (typeChart.effectiveAgainst?.includes(opponent.elementalType)) multiplier = 2;
            if (typeChart.weakAgainst?.includes(opponent.elementalType)) multiplier = 0.5;
        }
        return Math.floor(base * multiplier * (0.85 + Math.random() * 0.3));
    }

    _generateOpponentMoves(opponent) {
        const type = opponent?.elementalType || 'dust';
        const moveMap = {
            dust:  [{ name: "Earthen Crush",   power: 40, damageType: "Ground", level: 'pshat', icon: "💨" }],
            water: [{ name: "Taanug Flood",     power: 45, damageType: "Water",  level: 'pshat', icon: "🌊" }],
            fire:  [{ name: "Pride Inferno",    power: 55, damageType: "Fire",   level: 'pshat', icon: "🔥" }],
            air:   [{ name: "Vanity Gust",      power: 38, damageType: "Air",    level: 'pshat', icon: "💨" }],
            void:  [{ name: "Void Shriek",      power: 70, damageType: "Air",    level: 'drush', icon: "⚫" }]
        };
        return moveMap[type] || moveMap.dust;
    }
}
