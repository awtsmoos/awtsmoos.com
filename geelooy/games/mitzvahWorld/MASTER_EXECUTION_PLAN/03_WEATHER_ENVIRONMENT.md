B"H
Boruch Hashem
Blessed be He

# 03 — Weather, Atmosphere, Climate, Environment Authority

## Core law
Weather is renderer-neutral world state, not particles. One environment authority must answer temperature, pressure, humidity, wind, clouds, precipitation, visibility, snowpack, surface wetness, soil moisture, runoff, hazards, and environmental consequences at any world coordinate/time.

## Existing weather lane to finish
Inspect `/Users/awtsmoos/.awtsmoos-weather-core-20260909` before duplicating work.
Known work includes weather state/presets, moving spatial fronts, realtime observation assimilation, surface memory, hazards, coupling, vertical profile, terrain coupling, cloud layers, lightning/thunder, and forecast sampling. Re-run tests before merging.

## Required atmospheric simulation
- [ ] spatial weather cells/fronts; player can walk from rain into sun;
- [ ] clear, scattered/partly/mostly cloudy, overcast, haze, drizzle, rain, heavy/torrential rain, snow, blizzard;
- [ ] low/mid/high cloud layers: stratus, cumulus, cumulonimbus, altostratus, cirrus;
- [ ] pressure systems, warm/cold fronts, multi-day continuity, post-frontal clearing;
- [ ] elevation lapse rate, pressure change, dynamic rain/snow line;
- [ ] orographic lift, mountain cloud, rain shadow, valley/mountain wind cycles;
- [ ] microclimates for ridge, valley, forest, river, coast, village/courtyard, slope/aspect;
- [ ] coherent 3D wind/gust fields, shelter/wakes/turbulence, not unrelated sine waves;
- [ ] fog: valley, river, mountain-cloud, morning/radiation; waterfall mist connects to same humidity system.
## Storms and precipitation
- [ ] rain cells linked to real cloud masses; distant rain curtains and virga;
- [ ] wind angle/drop size/intensity variation; roof/tree/terrain shelter;
- [ ] lightning: intra-cloud, cloud-to-cloud, cloud-to-ground, deterministic strike locations, physically plausible context;
- [ ] thunder delay by distance plus optional terrain echo/reverb intent;
- [ ] gust fronts, downbursts/microbursts, hail, sleet, freezing rain, mixed precipitation;
- [ ] tornado potential requires convective storm + instability + shear + sufficient wind; support funnel cloud, tornado, waterspout where appropriate;
- [ ] dust devils and dust/sand storms are separate phenomena for hot/dry climates;
- [ ] snow varieties, accumulation depth, branch/roof interception, wind drifting, blowing snow, ground blizzards;
- [ ] frost, dew, melt/refreeze, icicles and ice-state hooks.

## Environmental memory and coupling
- [ ] wetness, mud, standing water, soil moisture, snow depth, frost, ice persist after precipitation stops;
- [ ] drying/melting depends on sun, temperature, airflow, shelter, drainage, and material;
- [ ] rain/snowmelt feeds hydrology/runoff/river state;
- [ ] vegetation consumes wind, gust, water availability, frost, snow loading, drought, storm damage;
- [ ] materials consume wetness/snow/mud/frost and change appearance physically;
- [ ] movement consumes traction/deep snow/mud/ice state;
- [ ] audio consumes rain, wind, thunder, snow damping and surface type;
- [ ] NPCs/animals consume storm, temperature, visibility, shelter, travel conditions;
- [ ] world history keeps summarized recent weather so yesterday's storm matters today.

## Realtime outside-weather mode
- [ ] Core never requests location/network itself; accept a provider-neutral observation contract.
- [ ] Modes: `procedural`, `hybrid`, `realtime`.
- [ ] Approximate/manual location supported; precise device location optional and privacy-conscious.
- [ ] Cache/freshness/confidence fields: observed, forecast, stale-cache, procedural fallback.
- [ ] API/provider outage must never block boot or gameplay.
- [ ] Smooth assimilation; do not abruptly replace sky/world when an observation arrives.
- [ ] Optional real sunrise/sunset/daylight synchronization; world-climate mode remains independent.
## Presentation targets outside Core
- [ ] moving cloud shadows; cloud sunlight transmission and shadow softness;
- [ ] atmospheric perspective/haze matching the mountain-valley reference art;
- [ ] volumetric/card/impostor cloud quality tiers driven by the same Core state;
- [ ] near precipitation particles, cheaper far precipitation volumes/curtains;
- [ ] lightning illuminates clouds/world; accessibility limits rapid flashes;
- [ ] sunrise, golden hour, blue hour, night, moon/stars, cloud occlusion, moon phase;
- [ ] rainbows/halos/god-rays only when geometry/atmosphere supports them;
- [ ] visibility-aware streaming: fog/blizzard lowers far-view demand; crystal-clear air expands it.

## Performance / persistence
- [ ] weather simulation timestep decoupled from render FPS;
- [ ] far weather updates statistically/coarsely; near weather resolves spatial detail;
- [ ] never persist raindrops/snowflakes—persist meaningful atmospheric state/history only;
- [ ] deterministic seeds for replay/multiplayer; cosmetic particles may be client-local;
- [ ] extreme-value clamps and malformed-provider fuzz tests;
- [ ] suspend/resume does not simulate hours of particles; advance summarized state cheaply;
- [ ] storm, blizzard, clear-vista, fog, tornado/dust benchmark scenes with frame/memory budgets.

## Acceptance tests
- [ ] same seed/time/position produces stable meaningful weather;
- [ ] forecast sampling does not mutate live clock;
- [ ] mountain can snow while lower village rains;
- [ ] windward side receives more precipitation than leeward where appropriate;
- [ ] sunny state has negligible tornado potential;
- [ ] thunder delay increases with strike distance;
- [ ] precipitation ends but wetness/mud/snow history remains and decays correctly;
- [ ] network/weather-provider failure leaves the world playable.