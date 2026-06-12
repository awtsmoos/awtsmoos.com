/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import {damageBand} from './state/damageBand.js';import {airFlags} from './state/airState.js';import {landingImpact,landingSquash} from './state/landingImpact.js';import {stateClassifier} from './state/stateClassifier.js';
export function animationState(f){const kind=stateClassifier(f),air=airFlags(f),squash=f.grounded?landingSquash(f)+(kind==='squat'?.18:0):-Math.min(.16,Math.abs(f.vy||0)*.006);return{kind,speed:Math.abs(f.vx||0),charge:f.chargeGlow||0,squash,landingImpact:landingImpact(f),damageBand:damageBand(f.damage||0),stretch:Math.max(0,-squash),crouch:kind==='squat'||kind==='landing'?1:0,airborne:!f.grounded,...air,attack:f.attack?.id||''}}
