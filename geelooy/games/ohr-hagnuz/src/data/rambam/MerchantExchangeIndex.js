/**
 * B"H
 * @module MerchantExchangeIndex
 * @description Temptations of the Merchant of Exchange.
 *
 * Chapter 312: The market learned to speak in bargains. The Awtsmoos creates
 * wealth and hunger from nothing every instant, yet this index records the
 * false offers: sell memory, gift, song, blessing, or fruit for speed. Every
 * bargain has a price in declaration truth.
 */
const offer = (id, title, lure, cost, gain, consequence, repair) => ({ id, title, lure, cost, gain, consequence, repair });

export const MerchantExchangeOffers = {
  sell_terumah: offer('sell_terumah', 'Sell the First Lifted Portion', 'Gain 50 zuzim now.', { gift: 'terumah' }, { money: 50 }, 'The Kohen line locks until repaired.', 'Restore Terumah to the Kohen and refuse the refund.'),
  rent_song: offer('rent_song', 'Rent the Levi Song', 'Skip the song-road for a fee.', { skill: 'Song' }, { shortcut: 'levi_road' }, 'Noise replaces song encounters.', 'Sing three Niggun responses in debate.'),
  discount_poor: offer('discount_poor', 'Discount the Poor Gate', 'Keep half the poor tithe.', { gift: 'maaser_ani' }, { money: 35 }, 'joyShared becomes false and market prices rise.', 'Give Maaser Ani with no reward.'),
  utility_joy: offer('utility_joy', 'Make Joy Efficient', 'Turn Maaser Sheni into raw power.', { gift: 'maaser_sheni' }, { light: 20 }, 'Jerusalem rejects the utility argument.', 'Resolve sacred joy at Jerusalem.'),
  trophy_fruit: offer('trophy_fruit', 'Keep First Fruit as Trophy', 'Gain prestige without gratitude.', { gift: 'bikkurim' }, { level: 1 }, 'Fruit becomes flavorless.', 'Bring Bikkurim and speak gratitude.')
};

export const merchantOfferById = id => MerchantExchangeOffers[id] || null;
export const allMerchantOffers = () => Object.values(MerchantExchangeOffers);
