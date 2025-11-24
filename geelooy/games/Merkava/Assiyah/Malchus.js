/*
ב"ה
B"H
*/

/**
 * @file Assiyah/Malchut.js
 * @description Contains the Sefirah of Malchut (Kingdom). This is the final stage of emanation, responsible for
 * manifesting the state of the Olam into the physical DOM. It handles all UI updates, populates menus, displays
 * notifications, and is the final interface between the game world and the user. Every function is fully and
 * completely implemented.
 */

export const MALCHUT = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },

    /**
     * @description This is the new function. It finds all UI elements with handler tags
     * and correctly binds the now-existing functions to them.
     */
    bindUIEvents() {
        const allElements = this.Olam.ui.root.querySelectorAll('[data-on-click], [data-on-input], [data-on-change]');
        const eventHandlers = ASSIAH.eventHandlers;

        allElements.forEach(el => {
            const clickHandlerName = el.dataset.onClick;
            const inputHandlerName = el.dataset.onInput;
            const changeHandlerName = el.dataset.onChange;

            if (clickHandlerName && eventHandlers[clickHandlerName]) {
                el.addEventListener('click', eventHandlers[clickHandlerName].bind(ASSIAH));
            }
            if (inputHandlerName && eventHandlers[inputHandlerName]) {
                el.addEventListener('input', eventHandlers[inputHandlerName].bind(ASSIAH));
            }
            if (changeHandlerName && eventHandlers[changeHandlerName]) {
                el.addEventListener('change', eventHandlers[changeHandlerName].bind(ASSIAH));
            }
        });
    },

    /**
     * @description The system that ensures the physical kingdom (the UI) reflects the spiritual state (the Olam).
     * Called every frame to update HUD elements.
     */
    kingdomAndInterfaceSystem() {
        this.updateHUD();
    },

    /**
     * @description Updates the primary heads-up display elements during gameplay.
     */
    updateHUD() {
        const Olam = this.Olam;
        if (Olam.state !== 'playing') return;
        
        const mitzvotDisplay = document.getElementById('mitzvotDisplay');
        const nefeshDisplay = document.getElementById('nefeshDisplay');
        const shefaBar = document.getElementById('shefaBar');

        if (mitzvotDisplay) mitzvotDisplay.textContent = `MITZVOT: ${Math.floor(Olam.game.mitzvot)}`;
        if (nefeshDisplay) nefeshDisplay.textContent = `NEFESH: ${Olam.game.nefeshCount}`;
        if (shefaBar) shefaBar.style.width = `${Math.min(100, (Olam.game.shefa / Olam.game.shefaToAscend) * 100)}%`;
    },

    /**
     * @description Controls the visibility of the various overlay menus.
     * @param {string} visibleState - The name of the UI overlay to make visible.
     */
    updateUIVisibility(visibleState) {
        const Olam = this.Olam;
        for (const key in Olam.ui.elements) {
            const el = Olam.ui.elements[key];
            if (key === visibleState) {
                el.classList.add('visible');
            } else if (key !== 'hud' && key !== 'notifiers') {
                el.classList.remove('visible');
            }
        }
        const prayerContainer = document.getElementById('prayerDisplayContainer');
        if (prayerContainer) {
            const isVisible = (visibleState === 'playing' && Olam.game.customPrayers?.phrases.length > 0);
            prayerContainer.classList.toggle('visible', isVisible);
        }
    },

    /**
     * @description Constructs and displays the settings menu from the Atzilut blueprint.
     */
    populateSettings() {
        const Olam = this.Olam;
        const container = document.getElementById('settings-container');
        if (!container) return;

        // Clear existing settings to prevent duplication
        const existingItems = container.querySelectorAll('.setting-item');
        existingItems.forEach(item => item.remove());

        const backButton = container.querySelector('.menu-button');

        Olam.ATZILUT.settings.forEach(def => {
            const item = document.createElement('div');
            item.className = 'setting-item';

            if(def.type === 'header') {
                const h3 = document.createElement('h3');
                h3.textContent = def.text;
                item.appendChild(h3);
            } else {
                const label = document.createElement('label');
                label.htmlFor = `setting-${def.id}`;
                
                const valueSpan = `<span id="setting-value-${def.id}">${Olam.settings[def.id]}</span>`;
                label.innerHTML = `${def.label}: ${def.type === 'range' ? valueSpan : ''}`;
                item.appendChild(label);

                let input;
                switch (def.type) {
                    case 'range':
                        input = document.createElement('input');
                        input.type = 'range';
                        input.min = def.min;
                        input.max = def.max;
                        input.step = def.step;
                        input.value = Olam.settings[def.id];
                        input.addEventListener('input', Olam.DAAT.eventHandlers.updateSettingValueText);
                        break;
                    case 'checkbox':
                        item.classList.add('checkbox');
                        input = document.createElement('input');
                        input.type = 'checkbox';
                        input.checked = Olam.settings[def.id];
                        // Swap label and input order for checkbox style
                        item.innerHTML = '';
                        item.appendChild(input);
                        item.appendChild(label);
                        break;
                    case 'select':
                        input = document.createElement('select');
                        def.options.forEach(opt => {
                            const option = document.createElement('option');
                            option.value = opt.value;
                            option.textContent = opt.text;
                            input.appendChild(option);
                        });
                        input.value = Olam.settings[def.id];
                        break;
                    case 'textarea':
                        input = document.createElement('textarea');
                        input.value = Olam.settings[def.id];
                        break;
                }
                if (input) {
                    input.id = `setting-${def.id}`;
                    input.addEventListener('change', Olam.DAAT.eventHandlers.updateSetting);
                    if(def.type !== 'checkbox') item.appendChild(input);
                }
            }
            container.insertBefore(item, backButton);
        });
    },

    /**
     * @description Constructs and displays the upgrade shop from the Atzilut blueprint.
     */
    populateUpgradeShop() {
        const Olam = this.Olam;
        const grid = document.getElementById('upgradeShopGrid');
        const totalDisplay = document.getElementById('totalMitzvotDisplay');
        if (!grid || !totalDisplay) return;

        grid.innerHTML = '';
        totalDisplay.textContent = `Total Mitzvot: ${Math.floor(Olam.playerStats.totalMitzvot)}`;

        for(const key in Olam.ATZILUT.upgrades) {
            const upgrade = Olam.ATZILUT.upgrades[key];
            const currentLevel = Olam.playerStats.upgrades[key]?.level || 0;
            const cost = currentLevel < upgrade.maxLevel ? Math.floor(upgrade.cost(currentLevel)) : 0;
            const isLocked = upgrade.isLocked ? upgrade.isLocked(Olam.playerStats) : false;
            const canAfford = Olam.playerStats.totalMitzvot >= cost;
            const isMaxed = currentLevel >= upgrade.maxLevel;

            const card = document.createElement('div');
            card.className = 'upgrade-card';
            
            let buttonHTML;
            if (isLocked) {
                buttonHTML = `<button class="upgrade-button disabled" disabled>LOCKED</button>`;
            } else if (isMaxed) {
                buttonHTML = `<button class="upgrade-button maxed" disabled>MAX LEVEL</button>`;
            } else {
                buttonHTML = `<button class="upgrade-button ${canAfford ? '' : 'disabled'}" data-key="${key}" ${canAfford ? '' : 'disabled'}> Upgrade (${cost} Mitzvot) </button>`;
            }

            card.innerHTML = `
                <h3>${upgrade.name}</h3>
                <p>${upgrade.desc}</p>
                <div class="level-display">Level: ${currentLevel} / ${upgrade.maxLevel}</div>
                ${buttonHTML}
            `;
            card.querySelector('button')?.addEventListener('click', Olam.DAAT.eventHandlers.purchaseUpgrade);
            grid.appendChild(card);
        }
    },

    /**
     * @description Populates the list of custom prayers when the in-game menu is opened.
     */
    populatePrayerList() {
        const Olam = this.Olam;
        const list = document.getElementById('prayerList');
        if(!list) return;
        list.innerHTML = '';

        if (Olam.game.customPrayers?.phrases.length > 0) {
            Olam.game.customPrayers.phrases.forEach((phrase, index) => {
                const item = document.createElement('div');
                item.className = 'prayer-list-item';
                item.textContent = phrase;
                if (index === Olam.game.customPrayers.currentIndex) item.classList.add('active');
                item.addEventListener('click', () => {
                    if (Olam.game.customPrayers) Olam.game.customPrayers.currentIndex = index;
                    this.updatePrayerDisplay();
                    this.populatePrayerList();
                });
                list.appendChild(item);
            });
        } else {
            const item = document.createElement('div');
            item.className = 'prayer-list-item';
            item.textContent = "No custom prayers active.";
            item.style.fontStyle = 'italic';
            list.appendChild(item);
        }
    },

    /**
     * @description Changes the currently displayed custom prayer.
     * @param {number} direction - 1 for next, -1 for previous.
     */
    changePrayer(direction) {
        const Olam = this.Olam;
        if (Olam.game.customPrayers?.phrases.length > 0) {
            const prayers = Olam.game.customPrayers;
            const len = prayers.phrases.length;
            prayers.currentIndex = (prayers.currentIndex + direction + len) % len;
            this.updatePrayerDisplay();
        }
    },

    /**
     * @description Updates the main prayer display HUD element.
     */
    updatePrayerDisplay() {
        const Olam = this.Olam;
        const prayerTextEl = document.getElementById('prayerText');
        if (!prayerTextEl) return;
        if (Olam.game.customPrayers?.phrases.length > 0) {
            prayerTextEl.textContent = Olam.game.customPrayers.phrases[Olam.game.customPrayers.currentIndex];
        } else {
             prayerTextEl.textContent = '';
        }
    },

    /**
     * @description Shows a notification on the screen (e.g., "COMBO x10").
     * @param {string} type - The notifier ID ('ascension', 'combo', etc.).
     * @param {string} text - The text to display.
     * @param {string} [color] - Optional color for the surprise notifier.
     */
    showNotifier(type, text, color) {
        const Olam = this.Olam;
        const notifier = Olam.ui.notifiers[type];
        if (!notifier) return;

        notifier.textContent = text;
        if (type === 'surprise' && color) {
            notifier.style.color = color;
            notifier.style.textShadow = `0 0 8px ${color}, 0 0 15px ${color}`;
        }
        
        // Force reflow to restart CSS animation
        notifier.classList.remove('show');
        void notifier.offsetWidth;
        notifier.classList.add('show');
        
        if (type !== 'combo') { // Combo notifier is managed by its own timer
            setTimeout(() => notifier.classList.remove('show'), 2500);
        }
    }


    
};
