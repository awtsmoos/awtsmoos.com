// B"H
/** @file currentNpcPanel.js @description Chapter 418: Right-side NPC portrait stats panel. */
export function currentNpcPanel(npc = {}) { return `<section class="ehud-panel ehud-npc"><h3>${npc.name || 'MITZVAH LEVEL GUIDE'}</h3><div class="ehud-avatar"></div><div class="ehud-row"><span>Wisdom</span><b>30</b></div><div class="ehud-row"><span>Kindness</span><b>26</b></div><div class="ehud-row"><span>Insight</span><b>30</b></div><p>Specialty: guidance. Opens the lava ladder challenges.</p></section>`; }
