// B"H

import { Game } from '../game.js';
import { INITIAL_BALL_COUNT, DEBT_THRESHOLD } from '../constants.js';
import * as persistence from '../persistence.js';
import { LEVELS } from '../level-loader.js';
import { showScreen, animateValue, toggleInventoryPanel, updatePerutaDisplay, showDebtCollector, toggleModal, upgradeLevelGetters, updateGameUI } from '../ui.js';
import { playVictoryFanfare, playStarPing } from '../audio.js';
import { POWER_UPS } from '../store/index.js'; // Updated Import

/**
 * The minister of gameplay. It orchestrates the beginning and end of game sessions.
 */
export class GameOrchestrator {
    constructor(elements) {
        this.elements = elements;
        this.game = null;
    }

    async onPerutasEarned(amount) {
        // This function is now only called by Game when it's NOT a custom level.
        await persistence.addPerutas(amount);
        const newTotal = await persistence.getPerutas();
        updatePerutaDisplay(newTotal);
    }

    async startLevel(level, isCustom = false) {
        if (this.game) this.game.destroy();
        
        if (!level) {
            console.error(`Level not found.`);
            showScreen('level-select');
            return;
        }

        const [
            ballUpgradeLevel, 
            perutaMagnetLevel,
            divineForesightLevel,
            rapidFireLevel,
            paddleSizeLevel,
            perutaInterestLevel,
            criticalStrikeLevel,
        ] = await Promise.all([
            persistence.getBallUpgradeLevel(),
            persistence.getPerutaMagnetLevel(),
            persistence.getDivineForesightLevel(),
            persistence.getRapidFireLevel(),
            persistence.getPaddleSizeLevel(),
            persistence.getPerutaInterestLevel(),
            persistence.getCriticalStrikeLevel(),
        ]);
        
        const upgrades = { perutaMagnetLevel, divineForesightLevel, rapidFireLevel, paddleSizeLevel, perutaInterestLevel, criticalStrikeLevel };
        // Ensure startingBalls is never less than 1, even if persistence returns something odd or user is in deep debt (though level logic prevents negative levels).
        // INITIAL_BALL_COUNT is 1. ballUpgradeLevel should be >= 0.
        const startingBalls = Math.max(1, (INITIAL_BALL_COUNT || 1) + (ballUpgradeLevel || 0));
        
        const totalInitialHealth = level.layout.flat().reduce((sum, item) => {
            const val = (typeof item === 'object' && item !== null) ? item.h : (item || 0);
            return sum + val;
        }, 0);
        const parTurns = level.id === 'infinite' ? '∞' : Math.ceil(totalInitialHealth / (startingBalls * 0.75)) + 5;

        showScreen('game-screen');
        this.game = new Game(
            level, 
            startingBalls, 
            parTurns,
            upgrades,
            (stats) => this.handleUiUpdate(stats),
            (score, turn) => this.onGameOver(score, turn, level),
            (amount) => this.onPerutasEarned(amount),
            (score, turn, time) => this.onLevelComplete(score, turn, level, parTurns, isCustom, upgrades.perutaInterestLevel, time),
            () => this.tryDivineIntervention(),
            isCustom
        );
        this.game.start();
    }
    
    async handleUiUpdate(stats) {
        // B"H - The UI must reflect the truth of the state.
        updateGameUI(stats);
        
        // Also dispatch for any other listeners
        document.dispatchEvent(new CustomEvent('ui-update', { detail: stats }));
        
        // Infinite Mode Bonus Check
        if (this.game && this.game.level.id === 'infinite' && stats.turn > 1 && stats.turn % 10 === 0 && !stats.isShooting) {
             // Every 10 turns in infinite mode, grant a survival bonus
             const survivalBonus = stats.turn * 5;
             await this.onPerutasEarned(survivalBonus);
        }
    }
    
    async startInfiniteMode() {
        const infiniteLevel = {
            id: 'infinite',
            name: "Infinite",
            static: false,
            layout: [[]],
        };
        await this.startLevel(infiniteLevel, false);
    }

    async restartLevel() {
        if (!this.game) return;
        const isCustom = this.game.isCustom;
        if (this.game.level.id === 'infinite') {
            await this.startInfiniteMode();
        } else if (isCustom) {
            await this.startLevel(this.game.level, true);
        } else {
            await this.startLevel(LEVELS.find(l => l.id === this.game.level.id), false);
        }
    }
    
    async startNextLevel() {
        if (!this.game || this.game.isCustom || this.game.level.id === 'infinite') return;
        const nextLevel = LEVELS.find(l => l.id === this.game.level.id + 1);
        if (nextLevel) {
            await this.startLevel(nextLevel, false);
        } else {
            showScreen('main-menu');
        }
    }

    goBackToMenu() {
        showScreen('main-menu');
    }

    /**
     * Calculates the potential penalty for resigning based on the current world state.
     */
    getPotentialPenalty() {
        if (!this.game || this.game.isCustom || this.game.level.id === 'infinite') return 0;
        const levelId = this.game.level.id || 1;
        const turn = this.game.state.turn;
        let penalty = Math.floor(25 * Math.pow(1.5, levelId));
        if (turn <= 1) {
            penalty = Math.floor(penalty * 0.1);
        }
        return penalty;
    }

    /**
     * Displays the Forfeit Modal to the user, confronting them with the truth of their departure.
     * Skips for Infinite or Custom modes as they have no penalty.
     */
    requestResign() {
        if (!this.game) {
            this.goBackToMenu();
            return;
        }

        // B"H - No penalty in Infinite or Custom, so skip the warning
        if (this.game.level.id === 'infinite' || this.game.isCustom) {
            this.resign();
            return;
        }

        const penalty = this.getPotentialPenalty();
        document.getElementById('forfeit-penalty-display').textContent = `${penalty} ¤`;
        
        const confirmBtn = document.getElementById('forfeit-confirm-button');
        const cancelBtn = document.getElementById('forfeit-cancel-button');
        
        confirmBtn.onclick = () => {
            toggleModal(false, 'forfeit-modal');
            this.resign();
        };
        
        cancelBtn.onclick = () => {
            toggleModal(false, 'forfeit-modal');
        };

        toggleModal(true, 'forfeit-modal');
    }
    
    async resign() {
        if (this.game) {
            // Trigger game over flow with resignation flag
            await this.onGameOver(this.game.state.score, this.game.state.turn, this.game.level, true);
        } else {
            this.goBackToMenu();
        }
    }

    /**
     * @param {number} score 
     * @param {number} turn 
     * @param {object} level 
     * @param {boolean} isResignation 
     */
    async onGameOver(score, turn, level, isResignation = false) {
        const hasSecondChance = await persistence.getPowerUpCount('second_chance') > 0;

        // Second Chance logic (only if not resigning)
        if (hasSecondChance && !this.game.isCustom && !isResignation) {
            await persistence.usePowerUp('second_chance');
            this.game.retryTurn();
            return; 
        }

        this.elements.finalScore.textContent = score;
        let finalPenalty = 0;

        if (!level.id.toString().startsWith('custom')) {
            if (level.id === 'infinite') {
                this.elements.penaltyAmount.textContent = '0';
            } else {
                // Exponential Penalty Logic: 25 * 1.5 ^ levelID
                // Mercy Rule: If resigning on Turn 1, penalty is drastically reduced (90% off).
                
                let penalty = Math.floor(25 * Math.pow(1.5, (level.id || 1)));
                
                if (isResignation && turn <= 1) {
                    penalty = Math.floor(penalty * 0.1); 
                }
                
                // Allow debt!
                await persistence.addPerutas(-penalty);
                finalPenalty = penalty;
                this.elements.penaltyAmount.textContent = `${penalty}`;
            }
        } else {
            this.elements.penaltyAmount.textContent = '0';
        }
        
        const highScore = await persistence.getHighScore();
        if (level.id === 'infinite' && turn > highScore) {
            await persistence.setHighScore(turn);
            await this.updateHighScoreDisplay();
        }

        if(this.game) this.game.destroy();
        showScreen('game-over-screen');
        const newPerutas = await persistence.getPerutas();
        updatePerutaDisplay(newPerutas);

        // --- CHECK DEBT COLLECTOR ---
        if (newPerutas < DEBT_THRESHOLD) {
            await this.triggerDebtCollector(newPerutas);
        }
    }

    async triggerDebtCollector(currentDebt) {
        // Collect sellable assets
        const assets = [];
        
        for (const powerUp of POWER_UPS) {
            if (powerUp.type === 'upgrade' && powerUp.id !== 'divine_foresight') {
                const getLevel = upgradeLevelGetters[powerUp.id];
                const level = await getLevel();
                if (level > 0) {
                    // Calculate "Value" loosely based on previous purchase cost
                    // Approximation: cost * 1.5^(level-1)
                    const estimatedValue = Math.floor(powerUp.cost * (powerUp.cost_increase_factor ** (level - 1)));
                    assets.push({
                        id: powerUp.id,
                        name: powerUp.name,
                        icon: powerUp.icon,
                        level: level,
                        value: estimatedValue,
                        type: 'upgrade'
                    });
                }
            }
        }
        
        showDebtCollector(currentDebt, assets, async (asset) => {
            // Sell logic
            const sellPrice = Math.floor(asset.value * 0.5);
            await persistence.addPerutas(sellPrice);
            
            // Downgrade
            if (asset.type === 'upgrade') {
                // We don't have a generic decrementer in persistence export map in ui.js easily accessible
                // but we know the IDs.
                if (asset.id === 'extra_balls') await persistence.decrementBallUpgradeLevel();
                if (asset.id === 'peruta_magnet') await persistence.decrementPerutaMagnetLevel();
                if (asset.id === 'rapid_fire') await persistence.decrementRapidFireLevel();
                if (asset.id === 'paddle_size') await persistence.decrementPaddleSizeLevel();
                if (asset.id === 'peruta_interest') await persistence.decrementPerutaInterestLevel();
                if (asset.id === 'critical_strike') await persistence.decrementCriticalStrikeLevel();
            }
            
            const updatedDebt = await persistence.getPerutas();
            updatePerutaDisplay(updatedDebt);
            
            // Re-trigger recursively to update list
            await this.triggerDebtCollector(updatedDebt);

        }, () => {
            // Continue callback
            toggleModal(false, 'debt-modal');
        });
    }

    async onLevelComplete(score, finalTurn, level, parTurns, isCustom, interestLevel, timeTaken) {
        this.elements.turnReport.textContent = `Your Turns: ${finalTurn} / Par: ${parTurns}`;
        
        // Time Formatting
        const totalSeconds = Math.floor(timeTaken || 0);
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        document.getElementById('time-report').textContent = `Time: ${m}:${s}`;
        
        let totalBonus = 0;
        let interestBonusText = '';
        let multiplierText = '';

        if (!isCustom) {
            // Stars: Weighted mix of Turns (70%) and Time (30% approx logic)
            // Par Time calc: parTurns * 12 seconds per turn approx.
            const parTime = typeof parTurns === 'number' ? parTurns * 12 : 9999;
            
            let turnScore = 0;
            if (finalTurn <= parTurns * 0.6) turnScore = 6;
            else if (finalTurn <= parTurns * 0.8) turnScore = 5;
            else if (finalTurn <= parTurns) turnScore = 4;
            else if (finalTurn <= parTurns * 1.2) turnScore = 3;
            else if (finalTurn <= parTurns * 1.5) turnScore = 2;
            else turnScore = 1;

            let timeScore = 0;
            if (timeTaken <= parTime * 0.5) timeScore = 6;
            else if (timeTaken <= parTime * 0.75) timeScore = 5;
            else if (timeTaken <= parTime) timeScore = 4;
            else timeScore = 2;

            // Final stars are average, rounded up
            const stars = Math.min(6, Math.ceil((turnScore + timeScore) / 2));

            // --- B"H ANTI-FARMING LOGIC ---
            // We fetch the previous record to see if this is an improvement.
            const record = await persistence.getLevelRecord(level.id);
            const isFirstClear = record.stars === 0;
            const isStarImprovement = stars > record.stars;
            // Strict improvement on time requires obtaining at least the same star tier.
            const isTimeImprovement = stars >= record.stars && timeTaken < record.time - 1; // 1 second buffer to prevent trivial updates
            
            const isImprovement = isFirstClear || isStarImprovement || isTimeImprovement;

            // Save the new record immediately if improved
            if (isImprovement) {
                 await persistence.saveLevelRecord(level.id, stars, timeTaken);
            }

            // Exponential Base Reward Logic: 25 * (1.3 ^ levelID)
            const baseBonus = Math.floor(25 * Math.pow(1.3, (level.id || 1)));
            const efficiencyBonus = Math.max(0, parTurns - finalTurn) * ((level.id || 1) * 5);
            // Time Bonus: +10 per second under par
            const timeBonus = Math.max(0, Math.floor(parTime - timeTaken)) * 5;
            
            const rawBonus = baseBonus + efficiencyBonus + timeBonus;
            
            let finalLevelBonus = 0;
            if (isImprovement) {
                finalLevelBonus = rawBonus;
                if (isFirstClear) multiplierText = "First Clear!";
                else if (isStarImprovement) multiplierText = "New Star Record!";
                else multiplierText = "New Time Record!";
            } else {
                finalLevelBonus = Math.floor(rawBonus * 0.1); // 10% for farming
                multiplierText = "Repeat (10%)";
            }

            const currentPerutas = await persistence.getPerutas();
            // Interest only if positive balance
            // Interest also reduced if farming to prevent low-level spam for interest
            const rawInterest = currentPerutas > 0 ? Math.floor(currentPerutas * 0.005 * interestLevel) : 0;
            const interestBonus = isImprovement ? rawInterest : Math.floor(rawInterest * 0.1);

            totalBonus = finalLevelBonus + interestBonus;
            await persistence.addPerutas(totalBonus);
            
            if (interestBonus > 0) {
                 interestBonusText = ` + ${interestBonus} interest`;
            }

            // Animate stars
            setTimeout(() => {
                playVictoryFanfare();
                const starSlots = Array.from({ length: 6 }, (_, i) => this.elements.starRating.children[i]);
                for (let i = 0; i < stars; i++) {
                    setTimeout(() => {
                        starSlots[i].classList.add('filled');
                        playStarPing();
                    }, i * 150);
                }
            }, 300);
        }
        
        this.elements.perutaBonus.innerHTML = `Bonus: +<span id="level-complete-bonus">0</span> ¤ <span class="interest-bonus">${interestBonusText}</span> <div style="font-size: 0.8em; color: #9ca3af; margin-top: 4px;">${multiplierText}</div>`;
        animateValue(document.getElementById('level-complete-bonus'), 0, totalBonus, 1000);

        const sparkleContainer = document.querySelector('#level-complete-screen .sparkle-container');
        sparkleContainer.innerHTML = Array.from({ length: 30 }, () => `<div class="sparkle" style="left: ${Math.random() * 100}%; animation-duration: ${Math.random() * 2 + 3}s; animation-delay: ${Math.random() * 4}s;"></div>`).join('');
        
        document.getElementById('next-level-button').style.display = !isCustom && LEVELS.find(l => l.id === level.id + 1) ? 'block' : 'none';
        
        showScreen('level-complete-screen');
        const newPerutas = await persistence.getPerutas();
        updatePerutaDisplay(newPerutas);
    }
    
    async tryDivineIntervention() {
        return await persistence.usePowerUp('divine_intervention');
    }

    async toggleInventory(show) {
        await toggleInventoryPanel(show, async (powerUpId) => {
            const success = await persistence.usePowerUp(powerUpId);
            if (success) {
                this.game?.applyPowerUp(powerUpId);
                await this.toggleInventory(false);
            }
        });
    }

    async updateHighScoreDisplay() {
        const highScore = await persistence.getHighScore();
        this.elements.highScoreDisplay.textContent = `High Score: ${highScore}`;
    }
}