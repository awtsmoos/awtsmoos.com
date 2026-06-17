/* B"H
Effect modes are climates: clean daylight, balanced rain, wet electric ocean, dream chorus clouds, vast stars, retro tape, and thunder without mud.
*/
export const EFFECT_MODES = {
    balanced: { id:'balanced', label:'Balanced Studio', chorusSend:.32, delaySend:.10, delayTime:.26, delayFeedback:.18, reverbSend:.46, saturationDrive:1.45 },
    clean: { id:'clean', label:'Clean Direct', chorusSend:.08, delaySend:0, delayTime:.22, delayFeedback:.08, reverbSend:.16, saturationDrive:1.05 },
    wet: { id:'wet', label:'Wet Electric Keys', chorusSend:.46, delaySend:.13, delayTime:.31, delayFeedback:.24, reverbSend:.62, saturationDrive:1.55 },
    dream: { id:'dream', label:'Awtsmoos Dream Wet', chorusSend:.72, delaySend:.10, delayTime:.31, delayFeedback:.18, reverbSend:.52, saturationDrive:1.34 },
    space: { id:'space', label:'Cinematic Space', chorusSend:.56, delaySend:.22, delayTime:.42, delayFeedback:.34, reverbSend:.78, saturationDrive:1.32 },
    retro: { id:'retro', label:'Retro Chorus Tape', chorusSend:.52, delaySend:.18, delayTime:.34, delayFeedback:.32, reverbSend:.38, saturationDrive:2.05 },
    punch: { id:'punch', label:'Punchy Stage', chorusSend:.18, delaySend:.06, delayTime:.18, delayFeedback:.12, reverbSend:.24, saturationDrive:1.85 },
    off: { id:'off', label:'Effects Off', chorusSend:0, delaySend:0, delayTime:.25, delayFeedback:0, reverbSend:0, saturationDrive:1 }
};
export const EFFECT_MODE_LIST = Object.values(EFFECT_MODES);
export function getEffectMode(id) { return EFFECT_MODES[id] || EFFECT_MODES.balanced; }
export function mergeEffectMode(preset, modeId) { return { ...preset, ...getEffectMode(modeId), effectMode: modeId || 'balanced' }; }
