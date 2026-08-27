// B"H
export const DEFAULT_CAMERA_RIGS = [
  { id:'establishing', name:'Goal Board Establishing', type:'establishingShot', targetMode:'multi', targetActors:['rabbi_left','rabbi_right'], x:0, y:128, zoom:.82, transition:'cut' },
  { id:'two_shot', name:'Centered Scholar Two Shot', type:'twoShot', targetMode:'multi', targetActors:['rabbi_left','rabbi_right'], x:0, y:132, zoom:1.03, transition:'ease' },
  { id:'ots_left', name:'Over Shoulder Left', type:'overTheShoulder', targetMode:'multi', targetActors:['rabbi_left','rabbi_right'], x:18, y:134, zoom:1.18, transition:'ease' },
  { id:'left_close', name:'Left Close Reaction', type:'reactionShot', targetMode:'actor', targetActors:['rabbi_left'], y:138, zoom:1.34, transition:'ease' },
  { id:'right_close', name:'Right Close Reaction', type:'reactionShot', targetMode:'actor', targetActors:['rabbi_right'], y:138, zoom:1.34, transition:'ease' },
  { id:'soup_insert', name:'Soup Insert', type:'foodInsert', targetMode:'prop', targetProp:'soup_bowl', y:138, zoom:1.5, transition:'cut' },
  { id:'book_insert', name:'Sefer Insert', type:'objectInsert', targetMode:'prop', targetProp:'table_book', y:138, zoom:1.48, transition:'cut' },
  { id:'final_wide', name:'Final Warm Wide', type:'wideShot', targetMode:'multi', targetActors:['rabbi_left','rabbi_right'], x:0, y:128, zoom:.84, transition:'ease' }
];
