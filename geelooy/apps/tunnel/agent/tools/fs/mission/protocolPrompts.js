// B"H
const PROMPTS={
  WILD_BRAINSTORM:'Brainstorm at least 50 improvements and/or new features or improvements to existing features. Go crazy. Include wild, realistic, strange, long-term, and high-leverage ideas.',
  REALITY_TRACK:'Take that wild plan and compress it into a concrete realistic track based on the actual repo, tools, time, risks, and what can truly be implemented.',
  FILE_TOUCH_MAP:'Tell in depth every file you will touch. Brainstorm every file needed to implement everything entirely, no exceptions, highest priority first.',
  STAGE_PLAN:'Write the stage plan: exact files, methods, tests, risks, and the smallest safe implementation sequence.',
  STAGE_EXECUTION:'Execute or simulate this stage with proof. Record commands, writes, checks, and observed outputs.',
  STAGE_REVIEW:'Write planned vs done, what is still missing, why, and what debt was created or resolved.',
  GAP_ANALYSIS:'Find every remaining gap, categorize by severity, and feed required gaps into continuation queue.',
  NEXT_GATE:'Write the strict one-letter gate for the next move. The answer must be exactly A, B, C, D, or E.'
};
function prompt(stage){return PROMPTS[stage]||'Continue the boss protocol stage with proof.';}
module.exports={PROMPTS,prompt};
