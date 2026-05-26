
// B"H
// js/data/moves/the_66_moves.js

export const moves66 = {
    // --- LETTERS ---
    'Paradox': { name: 'Paradox', power: 60, cost: 10, type: 'Keter', desc: 'A strike that defies logic. Uses Opponent\'s Attack against them.' },
    'Dualism': { name: 'Dualism', power: 30, cost: 8, type: 'Binah', desc: 'Strikes twice. Two is the beginning of plurality.' },
    'Run_Gimel': { name: 'Run', power: 40, cost: 5, type: 'Chesed', desc: 'Moves with the speed of kindness (Priority).' },
    'Nullify': { name: 'Nullify', power: 0, cost: 10, type: 'Malkuth', effect: { target: 'opponent', stat: 'attack', amount: -5 }, desc: 'Lowers opponent attack significantly.' },
    'Expression': { name: 'Expression', power: 50, cost: 8, type: 'Binah', desc: 'A breath of sound that manifests reality.' },
    'Unite': { name: 'Unite', power: 40, cost: 12, type: 'Tiferet', effect: { target: 'self', stat: 'hp', amount: 20 }, desc: 'Damages enemy and heals self.' },
    'Cut_Zayin': { name: 'Crown Cut', power: 70, cost: 15, type: 'Gevurah', desc: 'A sharp strike with a crowned sword. High Crit.' },
    'Transcend': { name: 'Transcend', power: 0, cost: 20, type: 'Binah', effect: { target: 'self', stat: 'defense', amount: 50 }, desc: 'Rising above the limitation of the body.' },
    'Conceal': { name: 'Conceal', power: 0, cost: 10, type: 'Yesod', effect: { target: 'self', stat: 'diligence', amount: 20 }, desc: 'Hides within the foundation. Raises Evasion.' },
    'Flash_Yud': { name: 'Yud Flash', power: 120, cost: 30, type: 'Chokhmah', desc: 'Concentrated wisdom. User must recharge next turn.' },
    'Bend_Kaf': { name: 'Bend', power: 30, cost: 5, type: 'Malkuth', effect: { target: 'opponent', stat: 'defense', amount: -5 }, desc: 'Forces the vessel to submit.' },
    'Teach_Lamed': { name: 'Teach', power: 20, cost: 5, type: 'Binah', desc: 'A lesson that strikes from above.' },
    'Open_Close': { name: 'Open/Close', power: 50, cost: 10, type: 'Chesed', desc: 'The pulse of the Mem. Consistent damage.' },
    'Fall_Nun': { name: 'Fall', power: 60, cost: 5, type: 'Gevurah', desc: 'A descent for the sake of ascent. Recoil damage.' },
    'Uplift_Samech': { name: 'Uplift', power: 0, cost: 0, type: 'Tiferet', effect: { target: 'self', stat: 'kavanah', amount: 15 }, desc: 'Supports the fallen. Restores Kavanah.' },
    'Perceive': { name: 'Perceive', power: 0, cost: 5, type: 'Chokhmah', effect: { target: 'opponent', stat: 'defense', amount: -10 }, desc: 'Sees through the opponent\'s defenses.' },
    'Speech_Pei': { name: 'Mouth of God', power: 55, cost: 10, type: 'Gevurah', effect: { target: 'opponent', stat: 'inflict_status', status: 'confuse' }, desc: 'Words that create and destroy.' },
    'Hunt_Tzadik': { name: 'Holy Hunt', power: 65, cost: 12, type: 'Yesod', desc: 'Pursues the sparks relentlessly.' },
    'Copycat_Kuf': { name: 'Monkey Mimic', power: 40, cost: 10, type: 'Qliphoth', desc: 'Imitates holiness, but without soul.' },
    'Need_Reish': { name: 'Poverty', power: 0, cost: 10, type: 'Malkuth', effect: { target: 'opponent', stat: 'hp', amount: -30 }, desc: 'Drains HP from the opponent to fill the lack.' },
    'Consume_Shin': { name: 'Consuming Fire', power: 70, cost: 15, type: 'Gevurah', effect: { target: 'opponent', stat: 'inflict_status', status: 'burn' }, desc: 'The fire that burns on the altar.' },
    'Truth_Tav': { name: 'Seal of Truth', power: 60, cost: 20, type: 'Malkuth', desc: 'The final word. Cannot miss.' },

    // --- PLAGUES ---
    'Blood_Water': { name: 'Blood Water', power: 40, cost: 10, type: 'Gevurah', effect: { target: 'self', stat: 'hp', amount: 20 }, desc: 'Turns water to blood. Drains life.' },
    'Frog_Croak': { name: 'Frog Croak', power: 20, cost: 5, type: 'Netzach', effect: { target: 'opponent', stat: 'diligence', amount: -10 }, desc: 'Endless noise lowers diligence.' },
    'Lice_Swarm': { name: 'Lice Swarm', power: 30, cost: 8, type: 'Hod', effect: { target: 'opponent', stat: 'defense', amount: -5 }, desc: 'Small, irritating attacks.' },
    'Beast_Roar': { name: 'Wild Roar', power: 60, cost: 12, type: 'Gevurah', desc: 'The chaos of wild animals.' },
    'Pestilence_Rot': { name: 'Pestilence', power: 0, cost: 15, type: 'Qliphoth', effect: { target: 'opponent', stat: 'inflict_status', status: 'poison' }, desc: 'A disease of the livestock.' },
    'Boil_Eruption': { name: 'Boils', power: 50, cost: 12, type: 'Gevurah', effect: { target: 'opponent', stat: 'inflict_status', status: 'burn' }, desc: 'Hot inflammation.' },
    'Hail_Fire_Ice': { name: 'Fire & Ice', power: 75, cost: 18, type: 'Tiferet', desc: 'A miraculous mixture of opposites.' },
    'Locust_Devour': { name: 'Locust Cloud', power: 40, cost: 10, type: 'Netzach', effect: { target: 'opponent', stat: 'kavanah', amount: -20 }, desc: 'Eats the spiritual sustenance (Kavanah).' },
    'Darkness_Thick': { name: 'Thick Darkness', power: 0, cost: 20, type: 'Gevurah', effect: { target: 'opponent', stat: 'inflict_status', status: 'blind' }, desc: 'Darkness so thick it can be touched.' },
    'Firstborn_Strike': { name: 'Midnight Strike', power: 150, cost: 50, type: 'Keter', desc: 'The ultimate judgment. Only usable at high cost.' },

    // --- OTHERS ---
    'Hospitality': { name: 'Open Tent', power: 0, cost: 15, type: 'Chesed', effect: { target: 'self', stat: 'full_heal' }, desc: 'Avraham\'s tent heals all wounds.' },
    'Binding': { name: 'Akeidah', power: 100, cost: 40, type: 'Gevurah', desc: 'Total self-sacrifice. Massive damage.' },
    'Dream_Solve': { name: 'Dream Solve', power: 0, cost: 10, type: 'Yesod', effect: { target: 'self', stat: 'diligence', amount: 20 }, desc: 'Interprets the reality.' },
    'Sweet_Singer': { name: 'Sweet Song', power: 0, cost: 10, type: 'Malkuth', effect: { target: 'self', stat: 'kavanah', amount: 50 }, desc: 'Psalms of David restore the soul.' },
    'Sabbath_Rest': { name: 'Menuchah', power: 0, cost: 30, type: 'Keter', effect: { target: 'self', stat: 'hp_regen' }, desc: 'Complete rest and regeneration.' },
    'Judge': { name: 'Judge', power: 65, cost: 14, type: 'Gevurah', effect: { target: 'opponent', stat: 'defense', amount: -8 }, desc: 'Clarifies the case and weakens false defenses.' }
};
