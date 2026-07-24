# B"H
# Phase Two — architecture

One controller owns a priority state machine independent of combat implementation. Existing bus events enter cast/melee/hit states. Clip policy chooses exact locomotion clips but never treats generic attack as a valid cast. A cached bone-pose binder discovers shoulders, arms, hands, spine, chest, neck, and head once. After the clip player updates, additive procedural poses maintain wind-up, channel, release, and fallback behavior. Locomotion resumes only after the action lock expires or cancels.
