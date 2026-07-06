// B"H
/** @file PlayerWalletRuntime.js @description Perutas enter and leave with receipts. */
export class PlayerWalletRuntime {
  constructor(runtime, starting=120){ this.runtime=runtime; this.balances=new Map([["player",starting]]); this.ledger=[]; }
  balance(actorId="player"){ return this.balances.get(actorId)||0; }
  add(actorId,amount,reason="add"){ const next=this.balance(actorId)+Math.max(0,amount); this.balances.set(actorId,next); this.ledger.push({actorId,amount,reason,type:"credit",at:Date.now(),balance:next}); return next; }
  spend(actorId,amount,reason="spend"){ if(this.balance(actorId)<amount) return {ok:false,balance:this.balance(actorId),needed:amount}; const next=this.balance(actorId)-amount; this.balances.set(actorId,next); this.ledger.push({actorId,amount,reason,type:"debit",at:Date.now(),balance:next}); return {ok:true,balance:next}; }
  snapshot(actorId="player"){ return { actorId, perutas:this.balance(actorId), ledger:this.ledger.filter(x=>x.actorId===actorId).slice(-20) }; }
}
export function createPlayerWalletRuntime(runtime,starting){ return new PlayerWalletRuntime(runtime,starting); }
export default createPlayerWalletRuntime;
