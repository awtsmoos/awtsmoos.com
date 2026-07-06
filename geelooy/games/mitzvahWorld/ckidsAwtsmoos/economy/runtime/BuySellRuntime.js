// B"H
/** @file BuySellRuntime.js @description Real peruta transactions for buy and sell. */
import { merchantProfile, merchantItems } from "./MerchantInventoryRuntime.js";
import { buyPrice, sellPrice } from "./PerutaPricingRuntime.js";
export class BuySellRuntime {
  constructor(runtime,wallet){ this.runtime=runtime; this.wallet=wallet; this.history=[]; this.inventory=new Map([["player",[]]]); }
  inv(actorId="player"){ if(!this.inventory.has(actorId)) this.inventory.set(actorId,[]); return this.inventory.get(actorId); }
  buy(actorId="player",merchantId="blacksmith",itemId){ const merchant=merchantProfile(merchantId), item=merchantItems(merchantId).find(x=>x.id===itemId); if(!item) return {ok:false,reason:"missing-item"}; const price=buyPrice(item,merchant), paid=this.wallet.spend(actorId,price,`buy:${itemId}`); if(!paid.ok) return {ok:false,reason:"not-enough-perutas",price,balance:paid.balance}; this.inv(actorId).push(itemId); const tx={ok:true,type:"buy",actorId,merchantId,itemId,price,balance:paid.balance}; this.history.push(tx); return tx; }
  sell(actorId="player",merchantId="blacksmith",itemId){ const inv=this.inv(actorId), index=inv.indexOf(itemId); if(index<0) return {ok:false,reason:"not-owned"}; const merchant=merchantProfile(merchantId), item=merchantItems(merchantId).find(x=>x.id===itemId)||{id:itemId,buy:10,sell:5,condition:1}; const price=sellPrice(item,merchant); inv.splice(index,1); const balance=this.wallet.add(actorId,price,`sell:${itemId}`); const tx={ok:true,type:"sell",actorId,merchantId,itemId,price,balance}; this.history.push(tx); return tx; }
  snapshot(actorId="player"){ return { actorId, inventory:this.inv(actorId), history:this.history.filter(x=>x.actorId===actorId).slice(-20) }; }
}
export function createBuySellRuntime(runtime,wallet){ return new BuySellRuntime(runtime,wallet); }
export default createBuySellRuntime;
