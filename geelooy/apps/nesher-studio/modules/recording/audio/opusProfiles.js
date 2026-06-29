/* B"H
Opus profiles: speech, music, and studio mixes each receive fitting breath.
*/
export const OPUS_AUDIO_PROFILES = [
  { id:'speech', label:'Speech', bitrate:96000, numberOfChannels:1 },
  { id:'standard', label:'Standard Stereo', bitrate:160000, numberOfChannels:2 },
  { id:'music', label:'Music High', bitrate:224000, numberOfChannels:2 }
];
export function getOpusProfile(id = 'standard') { return OPUS_AUDIO_PROFILES.find(p => p.id === id) || OPUS_AUDIO_PROFILES[1]; }
