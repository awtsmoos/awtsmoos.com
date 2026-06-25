// B"H
/** Starter recipes produce useful social objects, not random loot. */
export const RECIPES = Object.freeze({ starter_challah:{needs:['flour','water'],makes:'challah',kind:'food'}, kind_letter:{needs:['paper','ink'],makes:'letter',kind:'social'}, repair_wood:{needs:['wood','tool'],makes:'fixed_bench',kind:'repair'}, simple_candle:{needs:['wax','wick'],makes:'candle',kind:'light'} });
export function craft(recipeId, bag=[]){ const r=RECIPES[recipeId]; if(!r)return{ok:false,error:'missing'}; return{ok:true,item:{id:r.makes,name:r.makes.replaceAll('_',' '),kind:r.kind,craftedAt:Date.now()},used:r.needs}; }
export default { RECIPES, craft };
