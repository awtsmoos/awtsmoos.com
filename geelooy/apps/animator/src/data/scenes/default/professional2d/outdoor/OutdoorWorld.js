// B"H
import { OUTDOOR_WEATHER } from './OutdoorWeather.js';

export const OUTDOOR_WORLD = {
  id: 'professional_outdoor_plaza_world_v1',
  style: 'professional_2d_workshop',
  environment: 'professional_2d_outdoor_plaza',
  timeOfDay: .64,
  groundY: 214,
  cameraPolicy: 'face_first_cinematic_mobile_safe',
  detailDensity: 'feature_short_high',
  emotionalContinuity: 'storm_then_faces_then_shared_light',
  mobileSafe: true,
  visualPromise: 'outdoor_parallax_weather_light_face_acting',
  weather: OUTDOOR_WEATHER,
  background: { skyColorTop: '#16233f', skyColorBottom: '#7e8aa3', groundColor: '#39484d', rimLight: '#ffd978', shadow: 'rgba(8,14,25,.34)' },
  parallax: [
    { id: 'storm_sky_far', depth: .06, mood: 'rolling_cloud_gradient' },
    { id: 'distant_valley_rain', depth: .14, mood: 'rain_veil_horizon' },
    { id: 'far_hills_and_roofs', depth: .26, mood: 'dark_roofs_blue_hills' },
    { id: 'middle_plaza_arches', depth: .48, mood: 'stone_arches_wet_flags' },
    { id: 'hero_stage', depth: .78, mood: 'circular_wet_plaza' },
    { id: 'foreground_weather', depth: 1.08, mood: 'reeds_leaves_rain_streaks' },
    { id: 'light_fx', depth: 1.18, mood: 'lightning_lantern_puddles' }
  ],
  atmosphere: { rain: true, wind: true, lightning: true, puddles: true, lanternBloom: true, foregroundOcclusion: true }
};
