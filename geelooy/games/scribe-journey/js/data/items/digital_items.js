
// B"H
// js/data/items/digital_items.js

export const digitalItems = {
    'ban_hammer': { id: 'ban_hammer', name: 'Ban Hammer', desc: 'Artifact. +30 Attack. Strikes with judgment.', type: 'artifact', effect: { stat: 'attack', amount: 30 }, sellValue: 1000, rarity: 'legendary' },
    'nerf_dart': { id: 'nerf_dart', name: 'Nerf Dart', desc: 'Lowers enemy Attack by 10.', type: 'consumable', effect: { stat: 'debuff_attack', amount: 10 }, sellValue: 20 },
    'buff_bagel': { id: 'buff_bagel', name: 'Buff Bagel', desc: 'Raises all stats by 5.', type: 'consumable', effect: { type: 'buff_all_stats', amount: 5 }, sellValue: 50 },
    'scroll_of_patch': { id: 'scroll_of_patch', name: 'Patch Notes', desc: 'Fixes bugs (Cures all status).', type: 'consumable', effect: { stat: 'cure_status' }, sellValue: 100 },
    'grindstone_xp': { id: 'grindstone_xp', name: 'XP Grindstone', desc: 'Artifact. +50% XP Gain.', type: 'artifact', effect: { stat: 'xp_mult', amount: 1.5 }, sellValue: 2000, rarity: 'legendary' },
    'bot_whistle': { id: 'bot_whistle', name: 'Bot Whistle', desc: 'Summons a visual bot to "help".', type: 'consumable', effect: { type: 'summon_bot' }, sellValue: 100 },
    'salt_of_grief': { id: 'salt_of_grief', name: 'Salt of Grief', desc: 'Harvested from trolls.', type: 'material', sellValue: 10 },
    'pixel_dust': { id: 'pixel_dust', name: 'Pixel Dust', desc: 'Crafting material.', type: 'material', sellValue: 5 },
    'admin_key': { id: 'admin_key', name: 'Admin Key', desc: 'Unlocks the Developer Room.', type: 'key_item', rarity: 'mythic' },
    'report_form': { id: 'report_form', name: 'Report Form', desc: 'Stuns the enemy with bureaucracy.', type: 'consumable', effect: { stat: 'inflict_status', status: 'stun' }, sellValue: 30 },
    'cheat_code_paper': { id: 'cheat_code_paper', name: 'Cheat Code', desc: 'Artifact. +50 Luck.', type: 'artifact', effect: { stat: 'luck', amount: 50 }, sellValue: 5000, rarity: 'mythic' }
};
