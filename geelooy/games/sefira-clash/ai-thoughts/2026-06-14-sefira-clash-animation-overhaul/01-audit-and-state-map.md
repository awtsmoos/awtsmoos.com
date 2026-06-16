B"H
# Sefira Clash Animation Overhaul Audit

Observed files: js/render/fighters.js routes all visible fighters through js/render/v3/character/CharacterRenderer.js. CharacterRenderer resolves a rig using animation/AnimationController.js and draws sculpted body parts plus ChargeGlow and HitSpark. Current Pose.js collapses the living world into idle, run, jump, fall, punch, kick, hitstun. Run, Punch, Kick, Jump, Fall are small authored offsets; effects exist but many are placeholders.

Weaknesses:
1. No full state vocabulary: no sprint, turn, landing, hard landing, shield, death, respawn, grab, launch, wall bounce, ground bounce, dizzy, victory, taunt.
2. Attacks lack formal anticipation/action/follow-through/recovery phases.
3. Run has limb swing but not acceleration, braking, shoulder counter-rotation, head bob, hip push, or foot contact snap.
4. Jump/fall lacks squash, launch extension, peak hang, fastfall spear, and landing compression.
5. Hit reaction is stun-only and does not scale by damage, velocity, hitstop, combo energy, or attack heaviness.
6. Combo energy exists in AI/combat concepts but is not visually amplified in v3 renderer.
7. Silhouette separation is too small because pose selection is coarse and guardRig recenters head/neck too aggressively.

Complete state map now targeted:
Idle, Combat Idle, Walk, Run, Sprint, Brake, Turnaround, Jump Start, Rising, Peak, Falling, Fast Fall, Landing, Hard Landing, Punch Jab Start, Punch Jab Active, Punch Jab Recovery, Punch Combo, Rapid Punch, Charge Punch Start, Charge Punch Hold, Charge Punch Release, Kick Start, Kick Active, Roundhouse, Aerial Kick, Meteor Kick, Grab Start, Grab Hold, Grab Throw, Hit Light, Hit Medium, Hit Heavy, Launch, Wall Bounce, Ground Bounce, Stunned, Dizzy, Shield Idle, Shield Hit, Shield Break, Death, Respawn, Victory, Taunt.