// B"H
/**
 * Chapter 4: Perutah awoke first, a copper whisper under the boot.
 * Dinar answered with silver teeth, Sela boomed like a gate in the ribs,
 * and Maneh hid its royal face until the Awtsmoos threaded greed into mercy.
 *
 * @typedef {{kind:string,value:number,color:string,label:string,sound:string}} CoinKind
 */
export const COIN_KINDS = Object.freeze({
  perutah:{kind:'perutah',value:1,color:'#c98345',label:'פ',sound:'tik'},
  dinar:{kind:'dinar',value:5,color:'#d9f4ff',label:'ד',sound:'ring'},
  sela:{kind:'sela',value:20,color:'#ffd36a',label:'ס',sound:'gong'},
  maneh:{kind:'maneh',value:100,color:'#ff6ad5',label:'מ',sound:'choir'}
});

/** @param {object} coin raw level coin @returns {CoinKind} resolved sacred currency */
export function coinKind(coin){ return COIN_KINDS[coin.kind || 'perutah'] || COIN_KINDS.perutah; }

/** @param {object} bag mutable currency vessel @param {object} coin collected level coin */
export function collectCurrency(bag, coin){
  const kind = coinKind(coin); bag[kind.kind] = (bag[kind.kind] || 0) + 1;
  bag.shefa = (bag.shefa || 0) + kind.value; bag.chain = (bag.chain || 0) + 1;
  bag.bestChain = Math.max(bag.bestChain || 0, bag.chain); return kind;
}

/** @param {object} bag currency state @returns {string} compact HUD text */
export function currencyHud(bag){
  return `פ ${bag.perutah||0} · ד ${bag.dinar||0} · ס ${bag.sela||0} · מ ${bag.maneh||0} · Shefa ${bag.shefa||0} ×${bag.chain||0}`;
}
