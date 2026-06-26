// B"H
/**
 * ProfessionTrainingRuntime
 * Recipes become vessels revealed by teachers. Training now also speaks to the
 * starter arc, so the first craft step advances from actual profession learning.
 */
const BRANCHES = Object.freeze({ baker:['challah'], healer:['soup'], candlemaker:['candle'], repairer:['repaired_bench'], scribe:['letter'] });
const TRAINERS = Object.freeze({ baker:'miriam_baker', healer:'tova_child', candlemaker:'betzalel_crafter', repairer:'betzalel_crafter', scribe:'rebbe_akiva' });
function state(store={}){ store.professionTraining ||= { ranks:{}, learnedRecipes:[], trainedAt:[] }; return store.professionTraining; }
function event(type,detail){ globalThis.dispatchEvent?.(new CustomEvent(type,{detail})); return detail; }
export function professionTrainingOffers(store={}, profession='baker'){
  const s=state(store), recipes=BRANCHES[profession]||[], rank=s.ranks[profession]||0;
  return recipes.map((recipeId,i)=>({ profession, recipeId, trainerId:TRAINERS[profession]||'village_trainer', requiredRank:i+1, known:s.learnedRecipes.includes(recipeId), trainable:rank>=i || i===0, reason:rank>=i||i===0?'ready':'rank-required' }));
}
export function trainProfession(store={}, profession='baker'){
  const s=state(store); s.ranks[profession]=(s.ranks[profession]||0)+1; const offers=professionTrainingOffers(store,profession); for(const offer of offers) if(offer.requiredRank<=s.ranks[profession] && !s.learnedRecipes.includes(offer.recipeId)) s.learnedRecipes.push(offer.recipeId); const row={ profession, rank:s.ranks[profession], at:Date.now() }; s.trainedAt.push(row); s.trainedAt=s.trainedAt.slice(-40); const payload={ profession, rank:s.ranks[profession], learnedRecipes:s.learnedRecipes.slice(), offers:professionTrainingOffers(store,profession) }; event('mitzvah-world:profession-trained',payload); event('mitzvah-world:starter-signal',{ signal:'profession', evidence:payload }); return payload;
}
export function recipeKnown(store={}, recipeId='challah'){ return state(store).learnedRecipes.includes(recipeId); }
export function createProfessionTrainingRuntime(store={}){ return { train:p=>trainProfession(store,p), offers:p=>professionTrainingOffers(store,p), known:id=>recipeKnown(store,id), state:()=>state(store) }; }
export default { professionTrainingOffers, trainProfession, recipeKnown, createProfessionTrainingRuntime };
