/* B"H
Routes decide where the sparks live: realtime, video, both, or silence.
*/
import { elements } from '../ui.js';
export function currentEffectRoute() { return elements.effectRouteSelect?.value || 'both'; }
export function currentEffectKind() { return elements.effectSelect?.value || 'explosion'; }
export function allowsRealtimeEffects() { const r = currentEffectRoute(); return r === 'both' || r === 'realtime'; }
export function allowsVideoEffects() { const r = currentEffectRoute(); return r === 'both' || r === 'video'; }
export function videoRenderMode() { return allowsVideoEffects() ? currentEffectKind() : 'none'; }
export function realtimeRenderMode() { return allowsRealtimeEffects() ? currentEffectKind() : 'none'; }
