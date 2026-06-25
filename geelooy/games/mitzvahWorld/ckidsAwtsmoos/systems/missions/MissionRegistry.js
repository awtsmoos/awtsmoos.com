// B"H
/** Mission registry: quests emerge from shortages, sickness, rumors, and repair. */
export const STARTER_MISSIONS = Object.freeze([
  { id:'deliver_flour_for_bread_shortage', title:'Bring Flour for the Bread Shortage', trigger:'bread_shortage', place:'bakery', objectives:[{kind:'deliver_flour',needed:1,done:0}], reward:{reputation:{village:2,merchants:1}, memory:'delivered'} },
  { id:'bring_soup_to_sick_farmer', title:'Bring Soup to the Sick Farmer', trigger:'farmer_sick', place:'farm', objectives:[{kind:'bring_soup',needed:1,done:0}], reward:{reputation:{poorFamilies:2}, memory:'helped'} },
  { id:'repair_beis_midrash_bench', title:'Repair the Beis Midrash Bench', trigger:'bench_broken', place:'beis_midrash', objectives:[{kind:'repair_bench',needed:1,done:0}], reward:{reputation:{scholars:2}, memory:'crafted'} },
  { id:'clarify_kind_rumor', title:'Clarify the Kind Rumor', trigger:'rumor_distorted', place:'market_square', objectives:[{kind:'clarify_truth',needed:1,done:0}], reward:{reputation:{village:1}, memory:'honesty'} }
]);
export function missionsForState(state={}){ const out=[]; if((state.economy?.bread||0)<3) out.push(STARTER_MISSIONS[0]); if(state.villageProjects?.farmerSick) out.push(STARTER_MISSIONS[1]); if((state.villageProjects?.benchRepair||0)<1) out.push(STARTER_MISSIONS[2]); if((state.rumors||[]).some(r=>r.distortionAmount>=0.5)) out.push(STARTER_MISSIONS[3]); return out; }
export default STARTER_MISSIONS;
