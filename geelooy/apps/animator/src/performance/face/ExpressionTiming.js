// B"H
export class ExpressionTiming { static phase(t=0){return {eyeLead:Math.min(1,(t%900)/180),mouthLag:Math.min(1,Math.max(0,(t%900-120)/240)),settle:Math.min(1,(t%900)/600)};} }
