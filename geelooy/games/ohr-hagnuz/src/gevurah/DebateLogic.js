
import { StateRegister } from '../binah/StateRegister.js';
import { MasterWisdom } from '../data/debate/MasterWisdom.js';
import { DebateNavigator } from './logic/DebateNavigator.js';
import { DebateExecutor } from './logic/DebateExecutor.js';

/**
 * B"H
 * @class DebateLogic
 */
export class DebateLogic {
    static _cursorIdx = 0;
    static _isBusy = false;
    static _aHeld = true;
    static _bHeld = false;
    static _hooksBound = false;

    static digestTick() {
        if (!this._hooksBound) { this._bind(); this._hooksBound = true; }
        if (this._isBusy) return;

        const intents = window.AwtsmoosIntents || {};
        
        const listSize = this.getCurrentList().length;
        const nav = DebateNavigator.process(intents, this._cursorIdx, listSize);
        if (nav.changed) {
            this._cursorIdx = nav.newIdx;
            this.refreshUI();
        }

        if (intents.B && !this._bHeld) { this._bHeld = true; this.goBack(); }
        else if (!intents.B) this._bHeld = false;

        if (intents.A && !this._aHeld) { this._aHeld = true; this.handleSelection(); }
        else if (!intents.A) this._aHeld = false;
    }

    static _bind() {
        window.addEventListener('awtsmoos-battle-move-click', (e) => {
            if (!this._isBusy) {
                this._cursorIdx = e.detail;
                this.refreshUI();
                this.handleSelection();
            }
        });
    }

    static handleSelection() {
        const S = StateRegister;
        if (S.BattleMenuState === 'ROOT') {
            if (this._cursorIdx === 0) { S.BattleMenuState = 'CATEGORY'; this._cursorIdx = 0; }
            else if (this._cursorIdx === 1) { this.executeRedeemAction(); } // REDEEM
            else if (this._cursorIdx === 2) { this.logMessage("Bag is sealed during logic clashes."); }
            else if (this._cursorIdx === 3) { this.logMessage("You retreat..."); setTimeout(() => this.endEncounter(false), 1000); }
        } else if (S.BattleMenuState === 'CATEGORY') {
            const cats = ['mishnah', 'kabbalah', 'niggunim', 'yichud'];
            S.DebateCategory = cats[this._cursorIdx];
            S.BattleMenuState = 'LIST';
            this._cursorIdx = 0;
        } else if (S.BattleMenuState === 'LIST') {
            this.executeDebateAction();
        }
        this.refreshUI();
    }

    static goBack() {
        if (StateRegister.BattleMenuState === 'CATEGORY') StateRegister.BattleMenuState = 'ROOT';
        else if (StateRegister.BattleMenuState === 'LIST') StateRegister.BattleMenuState = 'CATEGORY';
        this._cursorIdx = 0;
        this.refreshUI();
    }

    static async executeDebateAction() {
        this._isBusy = true;
        const action = this.getCurrentList()[this._cursorIdx];
        if (!action) { this._isBusy = false; return; }

        await DebateExecutor.strike(
            action, 
            (msg) => this.logMessage(msg),
            () => {
                StateRegister.BattleMenuState = 'ROOT';
                this._cursorIdx = 0;
                this._isBusy = false;
                this.refreshUI();
            },
            (wasDefeated) => this.endEncounter(wasDefeated)
        );
    }

    static async executeRedeemAction() {
        this._isBusy = true;
        await DebateExecutor.tryRedeem(
            (msg) => this.logMessage(msg),
            () => {
                StateRegister.BattleMenuState = 'ROOT';
                this._cursorIdx = 0;
                this._isBusy = false;
                this.refreshUI();
            },
            (wasDefeated) => this.endEncounter(wasDefeated)
        );
    }

    static endEncounter(wasDefeated) {
        if (wasDefeated) StateRegister.HeroStats.light = StateRegister.HeroStats.maxLight;
        StateRegister.ActiveRealm = 'OVERWORLD';
        StateRegister.BattleMenuState = 'ROOT';
        this._cursorIdx = 0;
        this._isBusy = false;
        window.dispatchEvent(new Event('awtsmoos-battle-close'));
        if(window.AwtsmoosIntents) window.AwtsmoosIntents.A = 0;
    }

    static logMessage(msg) { window.dispatchEvent(new CustomEvent('awtsmoos-battle-log', { detail: msg })); }
    static refreshUI() { 
        window.AwtsmoosBattleCursor = this._cursorIdx;
        window.dispatchEvent(new Event('awtsmoos-battle-cursor')); 
    }
    static getCurrentList() {
        const cat = StateRegister.DebateCategory;
        return (StateRegister.Inventory[cat] || []).map(id => MasterWisdom[id]).filter(x => x);
    }
}
