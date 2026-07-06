// B"H
/** @file AnimalFoodCatalog.js @description Food carries species diet, nutrition, water, and body-condition meaning. */
export const ANIMAL_FOODS=Object.freeze({ grass:{kind:"plant",nutrition:.22,water:.08,diets:["grazer"]}, hay:{kind:"plant",nutrition:.32,water:.04,diets:["grazer"]}, grain:{kind:"seed",nutrition:.48,water:.02,diets:["grazer","bird"]}, insects:{kind:"protein",nutrition:.38,water:.05,diets:["bird","fish"]}, pondPlant:{kind:"water-plant",nutrition:.28,water:.3,diets:["waterfowl","fish"]}, cleanWater:{kind:"water",nutrition:0,water:.75,diets:["grazer","bird","waterfowl","fish"]} });
const DIET={ sheep:"grazer",goat:"grazer",cow:"grazer",deer:"grazer",gazelle:"grazer",chicken:"bird",turkey:"bird",dove:"bird",pigeon:"bird",duck:"waterfowl",goose:"waterfowl",fish:"fish" };
export function animalDiet(species="sheep"){ return DIET[species]||"grazer"; }
export function foodProfile(foodId="grass"){ return {id:foodId,...(ANIMAL_FOODS[foodId]||ANIMAL_FOODS.grass)}; }
export function edibleFoods(species="sheep"){ const diet=animalDiet(species); return Object.values(ANIMAL_FOODS).map((f,i)=>({id:Object.keys(ANIMAL_FOODS)[i],...f})).filter(f=>f.diets.includes(diet)); }
export function bestFoodFor(species="sheep", foods=[]){ const diet=animalDiet(species), list=foods.length?foods:edibleFoods(species); return list.map(f=>typeof f==="string"?foodProfile(f):f).filter(f=>f.diets?.includes(diet)).sort((a,b)=>(b.nutrition+b.water)-(a.nutrition+a.water))[0]||foodProfile("grass"); }
export default ANIMAL_FOODS;
