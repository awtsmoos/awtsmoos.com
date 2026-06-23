// B"H
export function generationBudgetFor({fps=60,ring="near",device="desktop"}={}){const base=fps<55?1.5:fps<60?2.5:4;const ringScale={near:1,mid:.7,far:.35,horizon:.1}[ring]??1;const deviceScale=device==="low"?.5:device==="mid"?.75:1;return Math.max(.25,base*ringScale*deviceScale)}
export default generationBudgetFor;
