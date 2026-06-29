// B"H
/** EconomyRuntime: supply, demand, market stalls, caravans, handcrafted goods. */
import { mutateFeature49State } from './Feature49State.js';
export function adjustSupply(item='flour', amount=1){ return mutateFeature49State(s=>{ s.supply ||= {}; s.supply[item]=(s.supply[item]||0)+amount; return s; }); }
export function priceFor(item='flour', base=10, state={}){ const supply=state.supply?.[item]||0, demand=state.demand?.[item]||0; return Math.max(1,Math.round(base*(1+demand/20)/(1+supply/30))); }
export function produceArtisanItem(crafter='artisan', kind='candlestick', traits=[]){ return mutateFeature49State(s=>{ s.artisanItems ||= []; const item={id:`${kind}_${Date.now()}`,crafter,kind,traits,quality:1+traits.length,createdAt:Date.now()}; s.artisanItems.unshift(item); s.artisanItems=s.artisanItems.slice(0,80); return s; }); }
export function openTemporaryCaravan(route='orchard_route', goods=['fruit','cloth']){ return mutateFeature49State(s=>{ s.caravans ||= []; s.caravans.unshift({route,goods,openUntil:Date.now()+20*60*1000}); s.caravans=s.caravans.slice(0,10); return s; }); }
export function marketInventory(state={}){ return Object.keys(state.supply||{}).map(item=>({item,price:priceFor(item,10,state),stock:state.supply[item]})); }
export default { adjustSupply, priceFor, produceArtisanItem, openTemporaryCaravan, marketInventory };
