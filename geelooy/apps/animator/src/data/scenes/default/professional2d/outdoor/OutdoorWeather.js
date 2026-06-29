// B"H

export const OUTDOOR_WEATHER = {
  rainIntensity: .76,
  windIntensity: .68,
  cloudSpeed: .24,
  puddleReflection: true,
  foregroundOcclusion: true,
  lanternBloomColor: '#ffd978',
  lightningMoments: [2200, 9200],
  colorScript: [
    { at: 0, skyTop: '#16233f', skyBottom: '#7e8aa3', key: '#8fb4ff', mood: 'cold_storm' },
    { at: 5200, skyTop: '#1a2948', skyBottom: '#b0a387', key: '#aeefff', mood: 'blue_spark' },
    { at: 12800, skyTop: '#263553', skyBottom: '#d6b06e', key: '#ffd978', mood: 'gold_courage' },
    { at: 16600, skyTop: '#344a68', skyBottom: '#f1c880', key: '#ffe6a1', mood: 'rain_glow' }
  ],
  lightBeats: [
    { at: 0, id: 'cold_storm_wide', strength: .28 },
    { at: 2200, id: 'lightning_silhouette', strength: .95 },
    { at: 5200, id: 'blue_puddle_spark', strength: .45 },
    { at: 9200, id: 'wind_nearly_kills_spark', strength: .22 },
    { at: 12800, id: 'hands_make_gold_shelter', strength: .72 },
    { at: 16600, id: 'rain_turns_to_lantern_glow', strength: 1 }
  ]
};
