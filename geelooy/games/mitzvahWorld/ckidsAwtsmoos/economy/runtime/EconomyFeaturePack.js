// B"H
/** @file EconomyFeaturePack.js @description Installs peruta wallet, merchants, buy/sell runtime, and shop UI state. */
import { createPlayerWalletRuntime } from "./PlayerWalletRuntime.js";
import { createBuySellRuntime } from "./BuySellRuntime.js";
import { shopUiState } from "../ui/ShopUiState.js";
export function installEconomyFeaturePack(runtime, { startingPerutas=120 }={}){ const wallet=createPlayerWalletRuntime(runtime,startingPerutas), buySell=createBuySellRuntime(runtime,wallet); const api={ wallet,buySell, shop:(args={})=>shopUiState({wallet,buySell,...args}), buy:(actorId,merchantId,itemId)=>buySell.buy(actorId,merchantId,itemId), sell:(actorId,merchantId,itemId)=>buySell.sell(actorId,merchantId,itemId), snapshot:(actorId="player")=>({ wallet:wallet.snapshot(actorId), inventory:buySell.snapshot(actorId) })}; runtime.economy=api; runtime?.markReady?.("economy:perutas", { startingPerutas }); return api; }
export default installEconomyFeaturePack;
