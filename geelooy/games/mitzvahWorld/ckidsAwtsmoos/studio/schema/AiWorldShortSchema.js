// B"H
import { platformActionShorthandTerms, speciesNames } from "../../platform/MitzvahPlatformCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export const AI_WORLD_SHORT_SCHEMA_VERSION = "mitzvah-ai-world-short-v2";

export const SHORTHAND_TERMS = Object.freeze({
  world:{ village:"starter_village", forest:"forest_edge", desert:"desert_outpost" },
  grass:{ lush:{ density:"high", nearClumps:true, lod:true }, sparse:{ density:"low", nearClumps:true, lod:true }, off:{ density:"none" } },
  house:{
    brick:{ material:"brick", style:"village-brick" },
    wood:{ material:"wood", style:"timber" },
    stone:{ material:"stone", style:"field-stone" },
    door:{ door:true, interactable:true },
    shop:{ service:"shop" },
    trainer:{ service:"trainer" }
  },
  roles:{
    questVendor:{ friendly:true, givesQuests:true, marker:"quest" },
    trainer:{ friendly:true, trainer:true, marker:"trainer" },
    shopkeeper:{ friendly:true, shop:true, marker:"shop" },
    villager:{ friendly:true, marker:"dialogue" }
  },
  shots:{
    wide:{ camera:"wide", lens:"24mm", framing:"establishing" },
    follow:{ camera:"follow", lens:"35mm", framing:"tracking" },
    dialog:{ camera:"overShoulder", lens:"50mm", framing:"dialogue" },
    action:{ camera:"action", lens:"35mm", framing:"dynamic" },
    close:{ camera:"closeup", lens:"70mm", framing:"face" },
    orbit:{ camera:"orbit", lens:"35mm", framing:"hero" }
  },
  actions:platformActionShorthandTerms(),
  species:speciesNames()
});

export function defaultAiWorldShortInput() {
  return {
    world:"village",
    seed:770,
    generate:["Village", "Population 120", "Marketplace", "Synagogue", "River", "Bridge", "Forest", "Rain", "Golden sunset"],
    population:120,
    weather:"golden_sunset_after_rain",
    grass:"lush",
    houses:[["brick", "door", "shop"], ["wood", "door", "trainer"]],
    animals:[
      { sp:"fox", n:6, p:.4, hostile:true, loot:"fur,coin" },
      { sp:"goat", n:4, friendly:false, quest:"kill" }
    ],
    npcs:[
      { id:"jill", role:"questVendor", q:"kill3fox", shop:"starter" },
      { id:"rebbe", role:"trainer", teach:["strike", "castSpark"] }
    ],
    quests:[
      { id:"kill3fox", chain:1, obj:"kill fox 3", xp:40, reward:"coin:5,item:cap" }
    ],
    movie:{
      shots:[
        ["wide", "village", 3],
        ["follow", "chossid", "walk", 4],
        ["dialog", "jill", "talkHands", 5],
        ["action", "chossid", "castStorm", 4]
      ]
    }
  };
}

export default { AI_WORLD_SHORT_SCHEMA_VERSION, SHORTHAND_TERMS, defaultAiWorldShortInput };
