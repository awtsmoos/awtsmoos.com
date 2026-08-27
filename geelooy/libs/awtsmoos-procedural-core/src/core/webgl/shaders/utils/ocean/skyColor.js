
// B"H
/**
 * @file skyColor.js
 * @brief The divine logic for calculating atmospheric color based on view direction,
 *        now contained in its own vessel to ensure proper hierarchical inclusion.
 */

export const FS_OCEAN_SKY_COLOR = `
vec3 getSkyColor(vec3 R) {
    float sunH = uLightDirection.y;
    vec3 dZenith = vec3(0.12, 0.32, 0.70), dHorizon = vec3(0.40, 0.80, 1.05);
    vec3 sZenith = vec3(0.05, 0.08, 0.18), sHorizon = vec3(1.2, 0.5, 0.15);
    float dayFactor = smoothstep(-0.15, 0.25, sunH);
    vec3 zenith = mix(sZenith, dZenith, dayFactor);
    vec3 horizon = mix(sHorizon, dHorizon, dayFactor);
    return mix(horizon, zenith, pow(max(0.0, R.y), 0.65));
}
`;
