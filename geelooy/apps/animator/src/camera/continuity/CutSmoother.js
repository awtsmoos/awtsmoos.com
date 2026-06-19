// B"H
export class CutSmoother{static apply(plan={},severity=0){return{...plan,transition:severity>2.2?'ease':'cut',duration:severity>2.2?520:220};}}
