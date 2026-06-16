/** B"H — attack choice with rapid, charge, grab, and kick variety. */
export function chooseAttack(out,bot,brain,veryClose,dy,stale){
 const phase=brain.clock%96;
 if(veryClose&&phase>70&&phase<82){out.grab=true;out.tactic='Grab';return out;}
 if((stale||phase>34)&&phase<58&&bot.grounded){out.kick=true;out.chargeKick=phase>48;out.aimY=dy<-40?-.5:0;out.tactic=out.chargeKick?'ChargeKick':'Kick';return out;}
 out.punch=true;out.rapidPunch=phase%28<14;out.chargePunch=stale&&phase%40>22;out.tactic=out.chargePunch?'ChargePunch':out.rapidPunch?'RapidPunch':'Punch';return out;
}
