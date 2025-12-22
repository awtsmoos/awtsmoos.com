
// B"H
// js/workers/combat/mivtzoim.js

// Mivtzoim is a non-violent encounter. 
// Instead of attacking HP, you apply "Inspiration" to fill their "Soul Meter".
// Instead of taking damage, you lose "Patience" (which acts like HP).

export function handleMivtzoimAction(state, action, sendUIUpdate, trigger) {
    const battle = state.battle;
    if (battle.awaitingConfirm) return;

    if (action.type === 'offer_item') {
        const item = state.db.items[action.itemId];
        // Calculate influence
        let influence = item.power || 10;
        
        // Bonus if the item matches the soul's need (Logic simplified here)
        if(battle.opponent.id === 'lost_soul' && item.id === 'tefillin_pair') influence *= 2;
        if(battle.opponent.id === 'cynical_pedestrian' && item.id === 'tzedakah_pennies') influence *= 1.5;

        battle.opponent.currentHp = Math.max(0, battle.opponent.currentHp - influence); // HP here represents "Resistance"
        battle.log = `You offered ${item.name}. The soul is stirred!`;
        
        // Remove consumable cost
        if(item.cost > 0) {
             // Logic to remove item or charge money would go here
        }

        if(battle.opponent.currentHp <= 0) {
            battle.log += " The soul is elevated! Mivtzah Complete!";
            battle.winner = 'player';
            battle.awaitingConfirm = true;
        } else {
            // Opponent turn (Rejection)
            trigger.runOpponentTurn();
        }
    }
    
    sendUIUpdate({ battle: getMivtzoimUIPayload(battle) });
}

export function getMivtzoimUIPayload(battle) {
    // Custom UI for Mivtzoim (Blue bars instead of red, etc)
    return {
        mode: 'mivtzoim',
        log: battle.log,
        player: {
            name: "Mivtzoim Volunteer",
            hpPercent: 100, // Volunteers don't lose HP, they lose time/patience
            emoji: '😊'
        },
        opponent: {
            name: "Uninspired Soul",
            hpPercent: (battle.opponent.currentHp / battle.opponent.maxHp) * 100, // Resistance Bar
            emoji: battle.opponent.emoji
        },
        menu: {
            buttons: [
                { action: 'offer_item', itemId: 'tefillin_pair', text: 'Offer Tefillin' },
                { action: 'offer_item', itemId: 'shabbat_candles', text: 'Offer Candles' },
                { action: 'offer_item', itemId: 'tzedakah_pennies', text: 'Give Tzedakah' },
                { action: 'flee', text: 'Move On' }
            ]
        }
    };
}
