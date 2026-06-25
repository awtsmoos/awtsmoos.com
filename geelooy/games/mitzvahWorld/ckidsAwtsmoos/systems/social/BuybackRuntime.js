// B"H
/**
 * BuybackRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function createBuybackRuntime(){ let rows=[]; return { add(item){rows.unshift({...item,at:Date.now()});rows=rows.slice(0,12);return rows;}, list(){return rows;}, take(id){const i=rows.findIndex(x=>x.id===id);return i>=0?rows.splice(i,1)[0]:null;} }; }
export default createBuybackRuntime;
