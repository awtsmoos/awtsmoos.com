// B"H
export class AxisOfActionGuard{static apply(plan={},prev={}){if(Math.abs((plan.angle?.yaw||0)-(prev.angle?.yaw||0))>170&&!plan.allowAxisBreak){plan.angle={...plan.angle,yaw:(prev.angle?.yaw||45)};plan.continuity={...(plan.continuity||{}),axisSafe:true};}return plan;}}
