// B"H
export const STARTER_STATION_ZONE_SPEC = Object.freeze({
  id:"mitzvah_world_starter_station",
  name:"Mitzvah Station Alef",
  center:{ x:0, y:0, z:0 },
  radius:42,
  purpose:"teach movement, camera, quest, dialogue, mitzvah action, Torah learning, combat safety, and world travel",
  stations:[
    { id:"movement_pad", label:"Movement Pad", task:"Walk, turn, and stop near the golden marker", position:{ x:-14, y:0, z:8 } },
    { id:"camera_balcony", label:"Camera Balcony", task:"Look around the village and find the sun", position:{ x:-4, y:0, z:16 } },
    { id:"dialogue_gate", label:"Dialogue Gate", task:"Speak to the first guide NPC", position:{ x:10, y:0, z:12 } },
    { id:"mitzvah_table", label:"Mitzvah Table", task:"Use an interaction/action button", position:{ x:16, y:0, z:0 } },
    { id:"torah_bench", label:"Torah Bench", task:"Open the learning path and accept a Torah goal", position:{ x:8, y:0, z:-14 } },
    { id:"practice_ring", label:"Practice Ring", task:"Try safe combat / target feedback", position:{ x:-12, y:0, z:-12 } },
    { id:"travel_sign", label:"Travel Sign", task:"Find the road toward the village", position:{ x:0, y:0, z:28 } }
  ],
  props:["welcome_arch","golden_path","school_board","training_ring","torah_bench","travel_sign","market_crate","guide_lantern"]
});
export default STARTER_STATION_ZONE_SPEC;
