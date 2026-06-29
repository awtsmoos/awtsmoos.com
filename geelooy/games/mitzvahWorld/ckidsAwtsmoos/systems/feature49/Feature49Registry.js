// B"H
/**
 * Feature49Registry
 * Forty-nine vessels of deeper life: each idea is named, budgeted, and grouped
 * so the Awtsmoos can reveal richness without frame-time arrogance.
 */
export const FEATURE49 = Object.freeze([
  ['dynamic_reputation','social','Dynamic town reputation changes greetings, prices, and trust.'],
  ['mitzvah_chains','mission','Multi-stage mitzvah chains unlock future opportunities.'],
  ['npc_memory','npc','NPCs remember favors, insults, and promises.'],
  ['ambient_conversations','npc','NPCs converse with each other without player prompting.'],
  ['shabbos_prep','calendar','Town visibly prepares before Shabbos.'],
  ['holiday_transformations','calendar','Holidays reshape decorations, schedules, and activities.'],
  ['family_graph','social','Family relationships propagate consequences.'],
  ['community_projects','world','Persistent communal projects grow from small actions.'],
  ['living_economy','economy','Supply and demand changes inventory and prices.'],
  ['artisan_items','profession','Professions create unique handcrafted items.'],
  ['torah_learning_dialogue','torah','Learning unlocks dialogue rather than raw power.'],
  ['mentor_adaptation','tutorial','Mentors adapt to the player interests.'],
  ['hidden_observation_stories','world','Stories are found by watching, not only markers.'],
  ['children_grow','npc','Child NPCs can age over long campaigns.'],
  ['seasonal_farming','profession','Planting follows seasons.'],
  ['wildlife_migration','ecology','Wildlife moves by season and pressure.'],
  ['bird_flocks','ecology','Flocks react to player movement.'],
  ['rainwater_puddles','weather','Rain creates puddles and streams.'],
  ['wind_simulation','weather','Wind affects trees, clothing, smoke, and sound.'],
  ['rumor_propagation','social','Information spreads organically.'],
  ['npc_journals','npc','NPC journals summarize actual events.'],
  ['market_inventory','economy','Market stalls reflect local production.'],
  ['dynamic_festivals','calendar','World achievements trigger festivals.'],
  ['npc_cooperation','npc','Villagers help each other solve problems.'],
  ['procedural_interiors','housing','House interiors reflect owner personality.'],
  ['real_library','torah','A readable library of in-game scholars.'],
  ['scroll_copying','profession','Scroll copying has handwriting variation.'],
  ['beis_midrash_discussion','torah','Study-house discussions continue indefinitely.'],
  ['event_sermons','torah','Sermons respond to recent village events.'],
  ['moral_dilemmas','mission','Choices have no obvious single correct answer.'],
  ['community_emergency','world','Emergencies require many NPC roles.'],
  ['cleanliness_sim','world','Neighborhood cleanliness affects mood.'],
  ['candle_lighting_model','rendering','Lighting responds to candle and lantern placement.'],
  ['interior_acoustics','audio','Rooms affect sound and conversations.'],
  ['animal_ownership','ecology','Animals need feeding and schedules.'],
  ['tool_wear','profession','Tools wear by material stress.'],
  ['tree_growth','ecology','Trees grow over months.'],
  ['building_renovations','housing','Renovations become visible over time.'],
  ['historical_archive','world','Archives record player accomplishments.'],
  ['pilgrim_visitors','social','Pilgrims arrive with distant stories.'],
  ['caravan_routes','economy','Caravans create temporary markets.'],
  ['mentor_apprentice','profession','NPC professions form mentor-apprentice pairs.'],
  ['genealogy','social','Families track generations.'],
  ['virtue_reputation','social','Reputation splits into honesty, generosity, wisdom, diligence, humility.'],
  ['crowd_behavior','npc','Crowds move as groups instead of per-NPC scripts.'],
  ['background_lod','performance','Simulation detail scales by distance and budget.'],
  ['deterministic_replay','debug','Events can replay deterministically for debugging.'],
  ['village_brain','simulation','Systems negotiate priorities instead of fixed update order.'],
  ['civilization_evolution','simulation','Long-term history reshapes architecture, economics, education, and traditions.']
].map(([id,domain,description],index)=>Object.freeze({ id, domain, description, index:index+1 })));
export const FEATURE49_BY_ID = Object.freeze(Object.fromEntries(FEATURE49.map(f=>[f.id,f])));
export function feature49List(domain=null){ return FEATURE49.filter(f=>!domain||f.domain===domain); }
export function feature49Get(id){ return FEATURE49_BY_ID[id] || null; }
export default { FEATURE49, FEATURE49_BY_ID, feature49List, feature49Get };
