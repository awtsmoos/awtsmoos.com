// B"H
// js/workers/shop.js
import { formatMoney } from '../data/database.js';
import * as Quests from './quests.js';

const merchantStock = [
    { itemId: 'manna_dew', price: 30 },
    { itemId: 'ink_of_potential', price: 50 },
    { itemId: 'kli_of_malkuth', price: 100 },
    { itemId: 'tome_of_pummel', price: 500 },
];

export function startShop(state, sendUIUpdate) {
    state.dialogue.branch = 'shop_main';
    advanceShop(state, sendUIUpdate);
}

function advanceShop(state, sendUIUpdate, action = {}) {
    let text = "Welcome, Scribe. What can I do for you?";
    let choices = [];

    // --- Perform Action ---
    if (action.buy) {
        const stockItem = merchantStock.find(s => s.itemId === action.buy);
        if (state.player.money.perutah >= stockItem.price) {
            state.player.money.perutah -= stockItem.price;
            Quests.giveItem(state, stockItem.itemId);
            text = `A wise choice! You purchased a ${state.db.items[stockItem.itemId].name}.`;
        } else {
            text = "You lack the coin for that, Scribe.";
        }
    }
    if (action.sell) {
        const itemIndex = state.player.inventory.findIndex(i => i.id === action.sell);
        if (itemIndex > -1) {
            const item = state.player.inventory[itemIndex];
            state.player.money.perutah += item.sellValue;
            state.player.inventory.splice(itemIndex, 1);
            text = `Sold ${item.name} for ${item.sellValue} Perutahs. A pleasure doing business.`;
        }
    }

    // --- Determine Next State ---
    switch (state.dialogue.branch) {
        case 'shop_buy':
            text = `My wares are concepts made manifest. Your current wealth: ${formatMoney(state.player.money)}`;
            choices = merchantStock.map(stock => ({
                text: `Buy ${state.db.items[stock.itemId].name} (${stock.price}p)`,
                action: { buy: stock.itemId }
            }));
            choices.push({ text: "Back", next: 'shop_main' });
            break;

        case 'shop_sell':
            const sellableItems = state.player.inventory.filter(i => i.sellValue > 0 && !i.isQuestItem);
            text = `What do you wish to part with? Your current wealth: ${formatMoney(state.player.money)}`;
            if (sellableItems.length > 0) {
                choices = sellableItems.map(item => ({
                    text: `Sell ${item.name} (${item.sellValue}p)`,
                    action: { sell: item.id }
                }));
            } else {
                text = "You have nothing of value to sell to me, Scribe.";
            }
            choices.push({ text: "Back", next: 'shop_main' });
            break;

        default: // 'shop_main'
            choices = [
                { text: "Buy Items", next: 'shop_buy' },
                { text: "Sell Items", next: 'shop_sell' },
                { text: "Leave", next: 'end' }
            ];
            break;
    }

    sendUIUpdate({ dialogue: { active: true, text, choices } });
}

export function handleShopChoice(state, choice, sendUIUpdate) {
    if (choice.next === 'end') {
        state.dialogue.active = false;
        state.mode = 'game';
        sendUIUpdate({ dialogue: { active: false } });
    } else {
        state.dialogue.branch = choice.next || state.dialogue.branch;
        advanceShop(state, sendUIUpdate, choice.action);
    }
}