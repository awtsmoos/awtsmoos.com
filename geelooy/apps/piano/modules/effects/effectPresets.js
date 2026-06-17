/* B"H
Effect climate for GSN source synth: wet enough to sound alive, cheap enough to play.
*/
export const EFFECT_MODES = {
    balanced: { id:'balanced', label:'Balanced Studio', chorusSend:.24, delaySend:.08, delayTime:.24, delayFeedback:.18, reverbSend:.28, saturationDrive:1.45 },
    clean: { id:'clean', label:'Clean Direct', chorusSend:.04, delaySend:0, delayTime:.22, delayFeedback:.08, reverbSend:.08, saturationDrive:1.05 },
    wet: { id:'wet', label:'Wet Electric Keys', chorusSend:.38, delaySend:.14, delayTime:.28, delayFeedback:.28, reverbSend:.42, saturationDrive:1.65 },
    dream: { id:'dream', label:'Awtsmoos Dream Wet', chorusSend:.52, delaySend:.12, delayTime:.31, delayFeedback:.22, reverbSend:.44, saturationDrive:1.8 },
    gsnCardboard: { id:'gsnCardboard', label:'GSN Cardboard Source', chorusSend:.34, delaySend:.16, delayTime:.23, delayFeedback:.3, reverbSend:.32, saturationDrive:2.45 },
    cardboardWet: { id:'cardboardWet', label:'GSN Wet Env Source', chorusSend:.42, delaySend:.18, delayTime:.24, delayFeedback:.32, reverbSend:.36, saturationDrive:2.35 },
    space: { id:'space', label:'Cinematic Space', chorusSend:.45, delaySend:.18, delayTime:.38, delayFeedback:.3, reverbSend:.56, saturationDrive:1.32 },
    retro: { id:'retro', label:'Retro Chorus Tape', chorusSend:.46, delaySend:.16, delayTime:.34, delayFeedback:.3, reverbSend:.32, saturationDrive:2.05 },
    punch: { id:'punch', label:'Punchy Stage', chorusSend:.14, delaySend:.04, delayTime:.18, delayFeedback:.1, reverbSend:.18, saturationDrive:2.2 },
    off: { id:'off', label:'Effects Off', chorusSend:0, delaySend:0, delayTime:.25, delayFeedback:0, reverbSend:0, saturationDrive:1 }
};
export const EFFECT_MODE_LIST = Object.values(EFFECT_MODES);
export function getEffectMode(id) { return EFFECT_MODES[id] || EFFECT_MODES.gsnCardboard; }
export function mergeEffectMode(preset, modeId) { return { ...preset, ...getEffectMode(modeId), effectMode: modeId || 'gsnCardboard' }; }
