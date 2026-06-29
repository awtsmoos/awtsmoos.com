/* B"H
Quality presets: common ladders for fast, balanced, and high revelation.
*/
export const QUALITY_EXPORT_PRESETS = [
  { id:'720p-fast', label:'720p Fast', width:1280, height:720, fps:30, profileId:'speed-vp8' },
  { id:'1080p-balanced', label:'1080p Balanced', width:1920, height:1080, fps:30, profileId:'balanced-vp8' },
  { id:'1440p-high', label:'1440p High', width:2560, height:1440, fps:30, profileId:'quality-vp9' },
  { id:'4k-if-supported', label:'4K if supported', width:3840, height:2160, fps:30, profileId:'quality-vp9' }
];
