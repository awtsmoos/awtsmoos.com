// B"H

import * as persistence from '../persistence.js';
import { populateCustomLevelsList, showScreen, populateStore, updatePerutaDisplay } from '../ui.js';
import { AiGenerator } from './ui/ai-generator.js';
import { Editor } from './ui/editor.js';
import { PurchaseTuner } from './ui/purchase-tuner.js';

/**
 * A map to get the correct persistence functions for an upgrade ID.
 * This sacred text connects the mortal ID to the divine rites.
 */
const upgradePersistenceMap = {
    'extra_balls': { 
        get: persistence.getBallUpgradeLevel, 
        inc: persistence.incrementBallUpgradeLevel,
        dec: persistence.decrementBallUpgradeLevel 
    },
    'peruta_magnet': { 
        get: persistence.getPerutaMagnetLevel, 
        inc: persistence.incrementPerutaMagnetLevel,
        dec: persistence.decrementPerutaMagnetLevel
    },
    'divine_foresight': { 
        get: persistence.getDivineForesightLevel, 
        inc: persistence.incrementDivineForesightLevel 
    },
    'rapid_fire': { 
        get: persistence.getRapidFireLevel, 
        inc: persistence.incrementRapidFireLevel,
        dec: persistence.decrementRapidFireLevel
    },
    'paddle_size': {
        get: persistence.getPaddleSizeLevel,
        inc: persistence.incrementPaddleSizeLevel,
        dec: persistence.decrementPaddleSizeLevel
    },
    'peruta_interest': {
        get: persistence.getPerutaInterestLevel,
        inc: persistence.incrementPerutaInterestLevel,
        dec: persistence.decrementPerutaInterestLevel
    },
    'critical_strike': {
        get: persistence.getCriticalStrikeLevel,
        inc: persistence.incrementCriticalStrikeLevel,
        dec: persistence.decrementCriticalStrikeLevel
    }
};

/**
 * The Minister of User Interfaces. This high-level servant orchestrates the various specialized UI managers,
 * such as the Editor and AI Generator, and manages the transitions between the major screens of the application.
 */
export class UIManager {
    constructor(elements, gameOrchestrator) {
        this.elements = elements;
        this.gameOrchestrator = gameOrchestrator;
        
        // Delegate specialized UI management to dedicated classes.
        this.editor = new Editor(elements, this);
        this.ai = new AiGenerator(elements, (levelData) => {
            this.elements.levelNameInput.value = levelData.name;
            const layout = levelData.layout.map(row => row.map(cell => cell === 0 ? null : cell));
            this.elements.editorGrid.dataset.layout = JSON.stringify(layout);
            this.editor.render();
        });
        this.purchaseTuner = new PurchaseTuner();
    }

    getCustomLevelListCallbacks() {
        return [
            // onPlay
            async (levelId) => {
                const customLevels = await persistence.getCustomLevels();
                const levelToPlay = customLevels.find(l => l.id === levelId);
                await this.gameOrchestrator.startLevel(levelToPlay, true);
            },
            // onEdit
            (levelId) => this.editor.showLevelEditor(levelId),
            // onDelete
            async (levelId) => {
                if (confirm('Are you sure you want to delete this level?')) {
                    await persistence.deleteCustomLevel(levelId);
                    await this.showCustomLevels();
                }
            },
            // onExport
            async (levelId) => {
                const customLevels = await persistence.getCustomLevels();
                const levelToExp = customLevels.find(l => l.id === levelId);
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(levelToExp));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `${levelToExp.name.replace(/\s+/g, '_')}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            }
        ];
    }
    
    async showCustomLevels() {
        await populateCustomLevelsList(this.elements.customLevelList, ...this.getCustomLevelListCallbacks());
        showScreen('custom-levels-screen');
    }
    
    getStoreCallbacks() {
        const onBuy = async (powerUp) => {
            if (powerUp.customizable) {
                const currentPerutas = await persistence.getPerutas();
                this.purchaseTuner.show(powerUp, currentPerutas, async (quantity, totalCost) => {
                    const success = await persistence.spendPerutas(totalCost);
                    if (success) {
                        await persistence.addPowerUp(powerUp.id, quantity);
                        const perutas = await persistence.getPerutas();
                        updatePerutaDisplay(perutas);
                        await this.showShop();
                    }
                });
                return;
            }
            
            let cost = powerUp.cost;
            if (powerUp.type === 'upgrade') {
                const level = await upgradePersistenceMap[powerUp.id].get();
                cost = Math.floor(powerUp.cost * (powerUp.cost_increase_factor ** level));
            }

            const success = await persistence.spendPerutas(cost);
            if (success) {
                if (powerUp.type === 'upgrade') {
                    await upgradePersistenceMap[powerUp.id].inc();
                } else {
                    await persistence.addPowerUp(powerUp.id, 1);
                }
                const perutas = await persistence.getPerutas();
                updatePerutaDisplay(perutas);
                await this.showShop();
            }
        };

        const onSell = async (powerUp) => {
            let refund = 0;
            let success = false;
            
            if (powerUp.type === 'upgrade') {
                const level = await upgradePersistenceMap[powerUp.id].get();
                if (level > 0 && upgradePersistenceMap[powerUp.id].dec) {
                    const lastLevelCost = Math.floor(powerUp.cost * (powerUp.cost_increase_factor ** (level - 1)));
                    refund = Math.floor(lastLevelCost * 0.5);
                    await upgradePersistenceMap[powerUp.id].dec();
                    success = true;
                }
            } else { // consumable
                const count = await persistence.getPowerUpCount(powerUp.id);
                if (count > 0) {
                    refund = Math.floor(powerUp.cost * 0.5);
                    await persistence.removePowerUp(powerUp.id, 1);
                    success = true;
                }
            }

            if (success) {
                await persistence.addPerutas(refund);
                const perutas = await persistence.getPerutas();
                updatePerutaDisplay(perutas);
                await this.showShop();
            }
        };
        
        return [onBuy, onSell];
    }
    
    async showShop() {
        await populateStore(this.elements.storeGrid, ...this.getStoreCallbacks());
        showScreen('store-screen');
    }
}