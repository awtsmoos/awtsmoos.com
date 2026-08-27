// B"H

const evolving = (id, type, memory, influence) => ({ id, type, memory, influence, static: false });

/**
 * The world remembers every touch. The mud is an archive, the rope a pendulum,
 * the lantern a small poem of fire in rain.
 */
export const ENVIRONMENTAL_DYNAMICS = {
  coherence: 'closed_loop_weather_surface_light_memory',
  systems: [
    evolving('puddle_accumulation', 'water', 'rain since previous scene', 'reflected lantern light'),
    evolving('footprints', 'terrain_memory', 'mentor and client crossing paths', 'crowd avoidance'),
    evolving('mud_deformation', 'terrain', 'fresh boot pressure', 'balance and gait'),
    evolving('wetness_propagation', 'surface', 'canvas drip trails', 'cloth saturation'),
    evolving('dripping_surfaces', 'rain', 'tarp leak rhythm', 'dialogue pauses'),
    evolving('cloth_saturation', 'costume', 'coats darken over time', 'fatigue and shiver'),
    evolving('wind_layers', 'air', 'gusts arrive in bands', 'hair, ropes, leaves'),
    evolving('moving_grass', 'flora', 'wind brushes foreground', 'depth parallax'),
    evolving('moving_leaves', 'flora', 'trees answer gusts', 'silhouette motion'),
    evolving('swinging_ropes', 'prop', 'recent tug from apprentice', 'hazard focus'),
    evolving('lantern_sway', 'prop_light', 'rope transfers wind', 'warm reflection'),
    evolving('atmospheric_fog', 'volume', 'rain cools ground air', 'background separation'),
    evolving('volumetric_rain', 'weather', 'density rises near tarp', 'shot mood'),
    evolving('reflected_lighting', 'light', 'puddles mirror faces', 'emotional focus')
  ]
};
