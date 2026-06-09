#!/usr/bin/env node
/**
 * B"H
 * @file visualTargetAudit.mjs
 * @description Chapter 492: The generated concept image becomes measurable,
 * but mobile density is allowed to preserve runtime headroom.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const n = emerald.nivrayim;
const keys = Object.keys(n.Domem || {});
const fail = (message, details) => { console.error(JSON.stringify({ ok: false, message, details }, null, 2)); process.exit(1); };
const starts = prefix => keys.filter(k => k.startsWith(prefix)).length;
const contains = part => keys.filter(k => k.includes(part)).length;
const details = { etzRoots: starts('etz_root_radial_'), etzLanterns: starts('etz_lantern_'), etzFireflies: starts('etz_firefly_'), plazaOuter: starts('plaza_outer_cobble_'), plazaInner: starts('plaza_inner_cobble_'), marketProduce: contains('_produce_'), roadEdges: contains('_edge_'), houseBanners: contains('_banner'), laundry: contains('_laundry_'), crowdMarkers: starts('ambient_crowd_marker_'), mountains: starts('distant_mountain_'), waterfalls: starts('distant_waterfall_'), clouds: starts('distant_cloud_band_'), distantHomes: starts('distant_village_home_'), fountain: Boolean(n.Domem.entry_fountain_basin), well: Boolean(n.Domem.entry_well_base), brook: starts('entry_brook_'), guidePedestal: Boolean(n.Domem.central_level_guide_pedestal), guideHalo: Boolean(n.Domem.central_level_guide_halo), guideRing: starts('central_level_guide_ring_') };
if (details.etzRoots < 20 || details.etzLanterns < 28 || details.etzFireflies < 24) fail('Etz Chayim centerpiece is not rich enough for mobile density', details);
if (details.plazaOuter < 32 || details.plazaInner < 20) fail('Radial plaza is not fully built', details);
if (details.marketProduce < 10) fail('Market produce/details too thin', details);
if (details.roadEdges < 240) fail('Road edge stones too thin', details);
if (details.houseBanners < 50 || details.laundry < 80) fail('House lived-in identity too thin', details);
if (details.crowdMarkers < 18) fail('Crowd life markers too thin', details);
if (details.mountains < 9 || details.waterfalls < 4 || details.clouds < 7 || details.distantHomes < 10) fail('Background vista layer too thin', details);
if (!details.fountain || !details.well || details.brook < 3) fail('Water landmarks missing', details);
if (!details.guidePedestal || !details.guideHalo || details.guideRing < 12) fail('Visible central level guide marker missing', details);
console.log(JSON.stringify({ ok: true, details }, null, 2));
