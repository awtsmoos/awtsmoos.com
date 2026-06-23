// B"H
export function shlichusBookPages(){return["quests","gossip","inventory","learning","map","missions","skills"].map((id,index)=>({id,index,title:id.replace(/-/g,' '),style:"parchment-page"}))}
export default shlichusBookPages;
