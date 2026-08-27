// B"H
export class EmotionShotPlanner{static candidates(event={}){return /power|hero/.test(`${event.emotion||''} ${event.angleIntent||''}`)?['heroShot','lowAngle','mediumCloseUp']:['closeUp','mediumCloseUp','reactionShot','dramaticPush'];}}
