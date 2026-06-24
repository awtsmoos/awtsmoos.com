// B"H
/** StorySeedGenerator: one broken fence becomes ten living consequences. */
const seeds=['Lost Goat','Broken Fence','Missing Tool','Traveling Merchant','Flooded Field','New Teacher'];
export class StorySeedGenerator{
  constructor(){this.index=0;}
  next(context={}){const title=seeds[this.index++%seeds.length];return{id:`story_${this.index}_${Date.now()}`,title,context,stage:0,createdAt:Date.now(),threads:[`${title} noticed`,`${title} affects neighbors`]};}
  fromEvent(event){return this.next({event});}
}
export default StorySeedGenerator;
