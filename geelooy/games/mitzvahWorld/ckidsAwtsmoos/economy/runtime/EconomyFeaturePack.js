// B"H
/** @file EconomyFeaturePack.js @description Installs wallet, merchants, gated buy/sell, repair, upgrade, and shop UI state. */
import { createPlayerWalletRuntime } from "./PlayerWalletRuntime.js";
import { createBuySellRuntime } from "./BuySellRuntime.js";
import { shopUiState } from "../ui/ShopUiState.js";
export function installEconomyFeaturePack(runtime,{startingPerutas=120}={}){ const wallet=createPlayerWalletRuntime(runtime,startingPerutas), buySell=createBuySellRuntime(runtime,wallet); const api={ wallet,buySell, shop:(args={})=>shopUiState({wallet,buySell,...args}), buy:(actorId,merchantId,itemId)=>buySell.buy(actorId,merchantId,itemId), sell:(actorId,merchantId,itemId)=>buySell.sell(actorId,merchantId,itemId), repair:(actorId,merchantId,itemId)=>buySell.repair(actorId,merchantId,itemId), upgrade:(actorId,merchantId,itemId)=>buySell.upgrade(actorId,merchantId,itemId), damageItem:(actorId,itemId,amount)=>buySell.damageItem(actorId,itemId,amount), snapshot:(actorId="player")=>({wallet:wallet.snapshot(actorId),inventory:buySell.snapshot(actorId)})}; runtime.economy=api; runtime?.markReady?.("economy:perutas", {startingPerutas, gates:Boolean(runtime.trainers)}); return api; }
export default installEconomyFeaturePack;
