// B"H
export function animationOverlayIntent({speed=0,emotion='calm',lookingAt=false,wind=.2}={}){return{breathing:emotion==='afraid'?.8:.35,weightShift:speed<.1?.45:.15,headTurn:lookingAt?.7:.2,eyeTrack:lookingAt,clothWind:wind*.4,gesture:emotion==='grateful'?'open-hands':emotion==='afraid'?'hunched':'idle-hands'}}
export default animationOverlayIntent;
