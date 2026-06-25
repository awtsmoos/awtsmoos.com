// B"H
/**
 * NpcStoryRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function storyLine(npc={},ctx={}){ const name=npc.name||'A villager'; const rep=ctx.reputation||0; if(rep>50)return name+' smiles: your kindness is known here.'; if(ctx.weather==='rain')return name+' hurries under the awning.'; return name+' has a small need and a larger hope.'; }
export function createNpcStoryRuntime(){ return { line:storyLine, rumor(){return 'The hidden courtyard is quieter when people help each other first.';} }; }
export default createNpcStoryRuntime;
