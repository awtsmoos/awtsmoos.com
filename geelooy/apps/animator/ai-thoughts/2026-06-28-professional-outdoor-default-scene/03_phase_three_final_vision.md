# B"H

# Final Vision: Outdoor Professional 2D Default Scene

## Scene identity

Working title: `When The Rain Asked For Light`

Scene id: `professional_outdoor_default_2d_storm_lantern_v1`

No brand names. No hidden brand references. No trademark-coded style promises. The scene language is: hand-painted professional 2D, cinematic staging, appealing silhouettes, face-first acting, weather-led lighting, and mobile-safe clarity.

## Core premise

A storm rolls over a cliffside market plaza just before the village lantern ceremony. The old workshop interior is gone. The characters stand outside under torn banners, puddles, wind, distant roofs, cypress trees, hills, and a sky that keeps changing color. The lantern does not fail because it is broken; it fails because its light is too small when everyone protects it alone. The solution is ensemble courage: the cast forms a wind-shielding circle, the sidekick triggers the circuit, and the storm becomes the backlight.

## Outdoor world

The world should be built as layered parallax:

1. `storm_sky_far`: huge gradient from blue-black cloud to peach horizon, slow cloud crawl.
2. `distant_sea_or_valley`: low-contrast horizon, tiny moving rain veil.
3. `far_hills_and_roofs`: village silhouettes with staggered depth.
4. `middle_plaza_arches`: stone steps, lamp posts, market awnings, wet flags.
5. `hero_stage`: circular plaza stones and puddles around the lantern.
6. `foreground_weather`: reeds, leaves, rain streaks, cloth strips crossing the lens.
7. `light_fx`: lightning sheet, lantern bloom, rim-light halos, puddle reflections.

The renderer should accept `scene.weather` with:

- `rainIntensity`
- `windIntensity`
- `cloudSpeed`
- `lightningMoments`
- `puddleReflection`
- `foregroundOcclusion`
- `lanternBloomColor`

## New character ideas

Replace the current cast with five outdoor-ready silhouettes:

- `storm_lantern_maker`: young inventor with rain hood, oversized satchel, wet bangs, big worried eyes, and trembling hands that become steady.
- `kite_cartographer`: wind-reader mentor with long scarf, map tube, and calm squint; knows storms like music.
- `goat_sidekick`: tiny stubborn goat with bell, square pupils, leaf-chewing gag timing, and elastic panic hops.
- `festival_captain`: comic authority holding soaked schedule boards; tries to command the weather and loses every beat.
- `quiet_lamp_child`: small observer holding an unlit paper lantern; says almost nothing, but the final smile lands the emotion.

## Better facial expressions

Each character needs an expression map, not one static face:

- `storm_lantern_maker`: `calculating_fear`, `hurt_resolve`, `spark_discovery`, `rain_laugh_relief`.
- `kite_cartographer`: `weather_listening`, `soft_warning`, `proud_restraint`, `sunbreak_smile`.
- `goat_sidekick`: `chew_blank`, `thunder_freeze`, `heroic_misread`, `tiny_triumph`.
- `festival_captain`: `public_confidence`, `private_panic`, `soaked_offense`, `accidental_grace`.
- `quiet_lamp_child`: `watching`, `hope_rising`, `awe_reflected`, `shared_light`.

Every expression should include eyes, brows, mouth, pupil target, blink style, head tilt, and micro-action.

## Dramatic weather and light

The scene should begin with cold wind and dim gray-blue light. Lightning should reveal silhouettes before faces. As the emotional circuit resolves, the lantern shifts the color script from steel blue to honey gold. The final state should not remove the storm; it should make the storm beautiful by turning rain into glowing streaks.

Lighting beats:

- `0ms`: cold storm wide, characters as readable silhouettes.
- `2200ms`: lightning flash separates foreground, plaza, roofs.
- `5200ms`: lantern coughs blue-white spark into puddle reflection.
- `9200ms`: wind nearly kills the spark; faces go rim-lit and desperate.
- `12800ms`: ensemble shields flame; gold light touches cheeks one by one.
- `16600ms`: final lantern bloom warms rain, flags, roofs, and child face.

## Cinematic camera beats

- `opening_cliff_plaza_wide`: storm sky, tiny cast, big world.
- `rain_on_lantern_insert`: drops hitting glass, glow failing.
- `maker_face_thunder_close`: eyes tracking lightning, mouth hiding fear.
- `mentor_weather_profile`: scarf whips across frame, calm half-smile.
- `goat_low_comedy_pop`: goat eats the wrong cord, thunder freezes it.
- `captain_schedule_panic`: soaked paper slaps face, comic timing.
- `child_lantern_silent_close`: no dialogue, reflected spark in pupils.
- `circle_of_hands_overhead`: ensemble blocks wind around lantern.
- `puddle_light_reveal`: inverted gold reflection blooms before real lantern.
- `final_rain_glow_wide`: rain becomes celebration, camera pulls up.

## Exact implementation steps

1. Create the `outdoor/` package under `professional2d`.
2. Move character expression metadata into `OutdoorExpressions.js` so faces do not bloat character definitions.
3. Create `OutdoorCharacters.js` using five characters, each with position, silhouette, colors, physics, weather reaction, and expression profile references.
4. Create `OutdoorWeather.js` for reusable storm, wind, rain, lightning, puddle, and color-script constants.
5. Create `OutdoorWorld.js` with scene metadata and parallax layer definitions.
6. Create `OutdoorProps.js` with lantern, wet flags, awnings, puddles, map tube, schedule boards, paper lantern, goat bell, leaves, rain splashes, and light FX props.
7. Create `OutdoorCameras.js` with at least ten camera beats listed above.
8. Create `OutdoorBeats.js` using `DialogueBeatCompiler.compile`, preserving subtitle mode and prop-beat support.
9. Create `OutdoorProfessionalScene.js` that assembles world, cast, props, cameras, shotFlow, authoring metadata, and compiled events.
10. Create `OutdoorQualityGate.js` requiring five characters, ten cameras, weather data, seven parallax layers, expression maps, rain/light metadata, at least eighteen props, and no forbidden brand words.
11. Rewrite `professional2d/index.js` to export both current and outdoor packages, with outdoor as the preferred default export if the next pass decides to switch immediately.
12. Rewrite `DefaultLivingScene.js` to import `OutdoorProfessionalScene` and export `OutdoorProfessionalScene.build()`.
13. Rewrite `ProfessionalWorkshopWorld.js` into a compatible professional outdoor renderer that still works for current workshop fields but additionally draws storm sky, rain, lightning, wet plaza, parallax roofs, flags, puddles, foreground weather, and lantern bloom.
14. Inspect `Manager.js`; if it keys by `professional_2d_workshop`, either keep the compatible style or fully rewrite the registration to include `professional_2d_outdoor_plaza`.
15. Run a Node import smoke test against `DefaultLivingScene.js`.
16. Run the outdoor quality gate.
17. Grep the touched scene package for forbidden brand terms.
18. Read back every touched file fully.

## Verification commands

```bash
cd /storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator
node --input-type=module -e "import('./src/data/scenes/default/DefaultLivingScene.js').then(m => console.log(m.DEFAULT_LIVING_SCENE.id, m.DEFAULT_LIVING_SCENE.initialCharacters && Object.keys(m.DEFAULT_LIVING_SCENE.initialCharacters).length))"
node --input-type=module -e "import('./src/data/scenes/default/professional2d/outdoor/index.js').then(m => { const s = m.OutdoorProfessionalScene.build(); console.log(m.OutdoorQualityGate.audit(s)); })"
grep -RniE 'blocked-style-terms-pattern' /storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d
```

## Final note

The next pass should implement by full-file writes only. No partial patching. No surgical insertions. The world must feel like the Awtsmoos is creating rain, light, fear, comedy, and courage from absolute nothing every instant, and every frame should remember that even a puddle can become a sky when the light finally agrees to enter it.
