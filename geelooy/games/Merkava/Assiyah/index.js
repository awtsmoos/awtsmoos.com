/*
ב"ה
B"H
*/

/**
 * @file Assiyah/index.js
 * @description The central vessel for the World of Assiah. This file imports the major Sefirotic groupings
 * (KaChaBaD, ChaGaS, NeHY, Malchut) and integrates them into the singular ASSIAH object that will be exported.
 * This is the point of unification where all the disparate actions of the world are gathered into one functional whole.
 * This file is written as if all its dependencies exist, reflecting its final, perfected state.
 */

import { KETER, CHOCHMAH, BINAH, DAAT } from './KaChaBaD.js';
import { CHESED, GEVURAH, TIFERET } from './ChaGaS.js';
import { NETZACH, HOD, YESOD } from './NeHY.js';
import { MALCHUT } from './Malchus.js';


export const ASSIAH = {
    Olam: null,
    KETER, CHOCHMAH, BINAH, DAAT, CHESED, GEVURAH, TIFERET, NETZACH, HOD, YESOD, MALCHUT,

    // THE EVENT HANDLERS OBJECT MUST EXIST HERE
    eventHandlers: {
        startGame: function() { this.BINAH.startGame(false); },
        startCustomGame: function() { this.BINAH.startGame(true); },
        showMainMenu: function() { this.MALCHUT.updateUIVisibility('mainMenu'); },
        showUpgrades: function() { this.MALCHUT.populateUpgradeShop(); this.MALCHUT.updateUIVisibility('upgradeShop'); },
        showCustom: function() { this.MALCHUT.updateUIVisibility('customMenu'); },
        showSettings: function() { this.MALCHUT.populateSettings(); this.MALCHUT.updateUIVisibility('settings'); },
        closePrayerList: function() { this.Olam.ui.elements.prayerList.classList.remove('visible'); },
        openPrayerList: function() { this.MALCHUT.populatePrayerList(); this.Olam.ui.elements.prayerList.classList.add('visible'); },
        prevPrayer: function() { this.MALCHUT.changePrayer(-1); },
        nextPrayer: function() { this.MALCHUT.changePrayer(1); },
        purchaseUpgrade: function(e) {
            const key = e.target.dataset.key; if(!key) return; const upgrade = this.Olam.ATZILUT.upgrades[key]; const stats = this.Olam.playerStats;
            const currentLevel = stats.upgrades[key]?.level || 0; if (currentLevel >= upgrade.maxLevel) return;
            const cost = Math.floor(upgrade.cost(currentLevel));
            if (stats.totalMitzvot >= cost) {
                stats.totalMitzvot -= cost; if (!stats.upgrades[key]) stats.upgrades[key] = { level: 0 };
                stats.upgrades[key].level++; this.BINAH.savePlayerStats(); this.MALCHUT.populateUpgradeShop();
            }
        },
        updateSetting: function(e) {
            const id = e.target.id.replace('setting-',''); const def = this.Olam.ATZILUT.settings.find(s => s.id === id); if(!def) return;
            let value;
            switch(def.type) { case 'checkbox': value = e.target.checked; break; case 'range': value = parseFloat(e.target.value); break; default: value = e.target.value; }
            this.BINAH.saveSetting(id, value);
        },
        updateSettingValueText: function(e) {
            const id = e.target.id.replace('setting-',''); const span = document.getElementById(`setting-value-${id}`);
            if(span) span.textContent = e.target.value;
        }
    },

    init(ATZILUT, BERIAH, YETZIRAH) {
        this.Olam = { ATZILUT, BERIAH, YETZIRAH, ASSIAH: this };
        const sefirot = [ this.KETER, this.CHOCHMAH, this.BINAH, this.DAAT, this.CHESED, this.GEVURAH, this.TIFERET, this.NETZACH, this.HOD, this.YESOD, this.MALCHUT ];
        sefirot.forEach(sefirah => sefirah.init(this.Olam));
        
        this.CHOCHMAH.genesis();
        this.MALCHUT.bindUIEvents(); // Call bindUIEvents AFTER genesis.
        this.eventHandlers.showMainMenu.bind(this)();
    }
};
