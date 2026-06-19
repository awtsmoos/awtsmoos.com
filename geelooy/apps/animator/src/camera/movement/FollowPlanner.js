// B"H
import { MovementPlan } from './MovementPlan.js';
export class FollowPlanner{static plan(){return MovementPlan.make('follow',{duration:500,easing:'gentle'});}}
