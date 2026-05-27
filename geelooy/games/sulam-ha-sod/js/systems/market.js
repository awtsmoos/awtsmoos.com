// B"H
/**
 * Chapter 25: the brutal market learned to rotate its display cases.
 * It sells yarmulkes and skins for Shefa only, never earthly money; each
 * purchase is a dream-bargain where the Awtsmoos measures style against risk.
 */
export const MARKET_SKINS = Object.freeze([
  {id:'plain',name:'Traveler White',cost:0,body:'#f8f0ff',trim:'#ffe28a',kippah:'#1a0b2d'},
  {id:'ember',name:'Klipah Ember Cloak',cost:35,body:'#ffb86b',trim:'#ff6ad5',kippah:'#3b0618'},
  {id:'ohr',name:'Ohr HaGanuz Robe',cost:80,body:'#d7fffb',trim:'#ffd36a',kippah:'#0f3c52'},
  {id:'gevurah',name:'Gevurah Iron Skin',cost:120,body:'#b9b1c8',trim:'#ff2f6d',kippah:'#20202a'},
  {id:'malach',name:'Malach Chrome Kippah',cost:180,body:'#ffffff',trim:'#9df7ff',kippah:'#ffd36a'}
]);

/** @param {object} market mutable market state @param {object} bag currency bag */
export function openMarket(market, bag){
  market.open = true; market.message = `Brutal Market: Shefa ${bag.shefa||0}. Press B to bargain.`;
}

/** @param {object} market market state @param {object} bag currency bag */
export function buyNextSkin(market, bag){
  const owned = new Set(market.owned || ['plain']);
  const next = MARKET_SKINS.find(s => !owned.has(s.id) && (bag.shefa || 0) >= s.cost);
  if(next){
    bag.shefa -= next.cost; owned.add(next.id); market.owned = [...owned]; market.equipped = next.id;
    market.message = `${next.name} purchased. The yarmulke burns brighter.`; return next;
  }
  const affordableOwned = MARKET_SKINS.filter(s => owned.has(s.id));
  const current = affordableOwned.findIndex(s => s.id === market.equipped);
  market.equipped = affordableOwned[(current + 1 + affordableOwned.length) % affordableOwned.length]?.id || 'plain';
  market.message = `No new skin affordable. Equipped ${equippedSkin(market).name}.`; return null;
}

/** @param {object} market market state @returns {object} equipped skin */
export function equippedSkin(market){ return MARKET_SKINS.find(s => s.id === market.equipped) || MARKET_SKINS[0]; }

/** @param {object} market market state @param {object} bag currency bag @returns {string} compact market HUD */
export function marketHud(market, bag){
  const next = MARKET_SKINS.find(s => !(market.owned || ['plain']).includes(s.id));
  return `Skin ${equippedSkin(market).name} · Next ${next ? `${next.name} ${next.cost}` : 'sold out'} · Shefa ${bag.shefa||0}`;
}
