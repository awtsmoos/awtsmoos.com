/**
 * B"H
 * @file BattleOverlay.js
 * @description
 * ⚔️ THE ARENA OF CLARIFICATION ⚔️
 * 
 * Chapter 32: The Torah Debate UI.
 * "A battle of the mind."
 * 
 * A Pokemon-style battle interface for Torah debates and Kelipa battles.
 * Displays stats, health, and slotted Pesukim as active moves.
 */

export const BattleOverlay = {
    generate(battleData) {
        const { chossid, opponent, chossidHp, opponentHp } = battleData;
        const slotted = chossid.slottedPassages || [];

        return {
            shaym: "battle-overlay",
            properties: {
                className: "battle-overlay",
                innerHTML: `
                    <div class="battle-container">
                        <!-- Opponent Side -->
                        <div class="opponent-section">
                            <div class="stat-box">
                                <div class="npc-name">${opponent.name}</div>
                                <div class="health-bar-container">
                                    <div class="health-bar" id="opponent-hp" style="width: 100%"></div>
                                </div>
                                <div class="hp-text">${opponentHp}/${opponent.maxHp || 100}</div>
                            </div>
                            <div class="opponent-visual">
                                <!-- Placeholder for NPC/Kelipa image/mesh -->
                            </div>
                        </div>

                        <!-- Player Side -->
                        <div class="player-section">
                            <div class="player-visual">
                                <!-- Placeholder for Player image/mesh -->
                            </div>
                            <div class="stat-box">
                                <div class="player-name">${chossid.name || "Chossid"}</div>
                                <div class="health-bar-container">
                                    <div class="health-bar" id="player-hp" style="width: 100%"></div>
                                </div>
                                <div class="hp-text" id="player-hp-text">${chossidHp}/${chossid.currentStats.health}</div>
                            </div>
                        </div>

                        <!-- Action Bar -->
                        <div class="battle-actions">
                            <div class="action-grid">
                                ${slotted.map((p, i) => `
                                    <button class="battle-btn" 
                                            title="Pshat: ${p.pshat || 'Surface meaning'}\nRemez: ${p.remez || 'Hinted meaning'}\nDrush: ${p.drush || 'Expository'}\nSod: ${p.sod || 'Secret'}"
                                            onclick="this.closest('awtsmoos-olam').ayshPeula('ui event', 'battleAction', {index: ${i}})">
                                        <div class="btn-icon">${p.icon || "📖"}</div>
                                        <div class="btn-text">
                                            <strong>${p.name}</strong>
                                            <div class="pardes-indicators">
                                                <span class="p-dot ${p.pshat ? 'active' : ''}">P</span>
                                                <span class="p-dot ${p.remez ? 'active' : ''}">R</span>
                                                <span class="p-dot ${p.drush ? 'active' : ''}">D</span>
                                                <span class="p-dot ${p.sod ? 'active' : ''}">S</span>
                                            </div>
                                        </div>
                                    </button>
                                `).join('')}
                                ${slotted.length < 4 ? `<button class="battle-btn empty">Empty Slot</button>`.repeat(4 - slotted.length) : ''}
                            </div>
                            <div class="battle-info">
                                <p id="battle-msg">B"H! What will you study to refine the ${opponent.name}?</p>
                                <div class="sub-actions">
                                    <button class="utility-btn" onclick="this.closest('awtsmoos-olam').ayshPeula('ui event', 'battleStats')">View Stats</button>
                                    <button class="utility-btn" onclick="this.closest('awtsmoos-olam').ayshPeula('ui event', 'battleSwitch')">Switch Pasuk</button>
                                    <button class="utility-btn retreat" onclick="this.closest('awtsmoos-olam').ayshPeula('ui event', 'battleEnd')">Retreat</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            }
        };
    }
};
