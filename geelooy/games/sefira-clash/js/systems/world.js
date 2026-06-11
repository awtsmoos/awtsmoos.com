import { createGameState } from '../core/state.js';
import { stepState } from '../core/loop.js';
export function createWorld(map,botCount=5){ const state=createGameState(map,botCount); state.step=input=>stepState(state,input); return state; }
