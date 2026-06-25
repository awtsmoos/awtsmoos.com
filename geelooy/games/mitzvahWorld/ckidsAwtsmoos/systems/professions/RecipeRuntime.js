// B"H
/**
 * RecipeRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export const RECIPES=Object.freeze({ starter_challah:{needs:['flour','water'],makes:'challah'}, kind_letter:{needs:['paper','ink'],makes:'letter'}, repair_wood:{needs:['wood','tool'],makes:'fixed_bench'}, simple_candle:{needs:['wax','wick'],makes:'candle'} });
export function craft(recipeId,bag=[]){ const r=RECIPES[recipeId]; if(!r)return{ok:false,error:'missing'}; return {ok:true,item:{id:r.makes,name:r.makes.replaceAll('_',' ')},used:r.needs}; }
export default { RECIPES, craft };
