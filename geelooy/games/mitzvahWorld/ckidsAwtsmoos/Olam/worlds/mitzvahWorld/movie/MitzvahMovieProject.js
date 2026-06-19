// B"H
/**
 * @file MitzvahMovieProject.js
 * @description Default generative movie project for Mitzvah World.
 *
 * This is not a single cutscene. It is a seed-library of scene kinds: arrival,
 * dialogue, learning, wildlife, loot, travel, and quest. The same schema can
 * accept any future JSON scene and unfold it into camera grammar.
 */
export const MITZVAH_MOVIE_PROJECT = Object.freeze({
  id:"mitzvah_world_universal_movie_generator",
  title:"Mitzvah World Universal Movie Generator",
  scenes:[
    { id:"arrival_village_light", title:"Arrival at the Village Light", kind:"discovery", mood:"awe", durationSec:18, location:{ position:[0,0,0] }, actors:[{ id:"player", role:"chossid", target:"player" }], beats:[{ id:"step_forward", at:5, kind:"action", actor:"player", action:"walk_forward", emotion:"curious" }] },
    { id:"rebbe_first_question", title:"The Rebbe Gives a Question", kind:"dialogue", mood:"warmth", durationSec:16, location:{ position:[-4,0,-9] }, actors:[{ id:"player", role:"chossid" }, { id:"village_rebbe", role:"rebbe" }], beats:[{ id:"rebbe_line", at:2, actor:"village_rebbe", text:"A mitzvah begins when the question becomes a path.", emotion:"gentle" }, { id:"player_answer", at:7, actor:"player", text:"Then I will walk the path.", emotion:"ready" }] },
    { id:"melamed_learning_glow", title:"Learning Glow in the School", kind:"learning", mood:"focused", durationSec:15, location:{ position:[-17,0,-29] }, actors:[{ id:"school_melamed", role:"teacher" }, { id:"player", role:"student" }], beats:[{ id:"teach", at:3, actor:"school_melamed", text:"Every letter carries light into action.", action:"teach_torah" }] },
    { id:"wildlife_encounter_loot", title:"Wildlife Encounter and Loot", kind:"loot", mood:"alert", durationSec:14, location:{ position:[8,0,10] }, actors:[{ id:"player", role:"chossid" }, { id:"wildlife", role:"animal" }], beats:[{ id:"inspect", at:4, actor:"player", action:"inspect_carcass", text:"There is useful loot here." }] },
    { id:"road_to_next_gate", title:"Road to the Next Gate", kind:"travel", mood:"motion", durationSec:20, location:{ position:[10,0,12] }, actors:[{ id:"player", role:"traveler" }], beats:[{ id:"move", at:2, actor:"player", action:"walk_path" }, { id:"arrive", at:14, actor:"player", action:"arrive_gate" }] },
    { id:"quest_reveal_star_gate", title:"Quest Reveal at the Star Gate", kind:"quest", mood:"wonder", durationSec:17, location:{ position:[-14,1.8,10] }, actors:[{ id:"player", role:"chossid" }, { id:"question_star_gate", role:"symbol" }], beats:[{ id:"quest_text", at:6, actor:"question_star_gate", text:"The next mission opens through action.", emotion:"radiant" }] }
  ],
  episodes:[{ id:"episode_001", title:"From Question to Action", scenes:["arrival_village_light","rebbe_first_question","melamed_learning_glow","wildlife_encounter_loot","road_to_next_gate","quest_reveal_star_gate"] }]
});

export default MITZVAH_MOVIE_PROJECT;
