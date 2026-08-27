// B"H

/**
 * @file CityParkDayPreset.js
 * @description
 * Chapter Twenty-Five: The city stepped back so the actors could speak.
 *
 * The background should support the performance, not compete with it. This
 * preset mutes skyline contrast, lowers building height, and keeps the park
 * readable behind the cast.
 */
export const CityParkDayPreset = {
  id: 'cityParkDay',
  theme: {
    skyTop: '#2684a8',
    skyBottom: '#65c2d1',
    sun: '#ffe779',
    cloud: '#d9f2ff',
    buildingDark: '#15394b',
    buildingMid: '#1b4b5f',
    buildingStroke: '#102a38',
    windowCool: 'rgba(157,228,255,0.72)',
    windowWarm: 'rgba(255,233,138,0.62)',
    sidewalk: '#bfc7c0',
    road: '#16181c',
    lane: '#e8e1c4',
    grass: '#25b96c',
    leaf: '#28aa61',
    leafStroke: '#106738',
    trunk: '#7a4a22'
  },
  celestial: [
    { id: 'sun_main', type: 'sun', xRatio: 0.82, yRatio: 0.26, radiusRatio: 0.045, glowRings: 5, depth: 0.06 }
  ],
  clouds: [
    { id: 'cloud_left', xRatio: 0.2, yRatio: 0.34, widthRatio: 0.18, opacity: 0.42, drift: 0.000018, depth: 0.12 },
    { id: 'cloud_mid', xRatio: 0.56, yRatio: 0.22, widthRatio: 0.23, opacity: 0.46, drift: 0.000014, depth: 0.1 },
    { id: 'cloud_sun', xRatio: 0.88, yRatio: 0.41, widthRatio: 0.17, opacity: 0.40, drift: 0.00002, depth: 0.16 }
  ],
  skyline: {
    count: 9,
    baseY: 'sidewalkTopY',
    minHeightRatio: 0.11,
    maxHeightRatio: 0.25
  },
  park: {
    treeCount: 6,
    baseY: 'roadTopY'
  },
  street: {
    roadTopY: 'roadTopY',
    roadBottomY: 'stageBottomY',
    laneYRatio: 0.48
  }
};
