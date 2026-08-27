// B"H
export class CutSeverityEstimator{static estimate(a={},b={}){return Math.abs((a.zoom||1)-(b.zoom||1))*3+Math.abs((a.x||0)-(b.x||0))/120+Math.abs((a.y||0)-(b.y||0))/120;}}
