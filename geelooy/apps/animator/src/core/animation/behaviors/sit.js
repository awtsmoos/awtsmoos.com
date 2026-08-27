
/* B”H */

/**
 * @constant SIT_BEHAVIOR
 * @description
 * THE KINEMATICS OF RESTING (Menucha).
 * When a character sits, their Netzach and Hod (legs) bend 90 degrees, 
 * and their body (Tiferet) drops to rest upon the vessel (Chair/Couch).
 */
export const SIT_BEHAVIOR = (time) => {
  return {
    bob: -60, // Drop the entire body downwards (negative is down in screen coords if offset correctly, actually in canvas Y is down, so bob modifies Y natively: Y = base - bob. If bob is negative, it goes DOWN). Wait, Y - (-60) = Y + 60. Yes, drops down!
    hipL: -80, // Bend thighs forward
    hipR: -80,
    kneeL: 90, // Bend calves straight down 
    kneeR: 90,
    armL: -20, // Arms resting slightly forward on lap
    armR: 20,
    torsoSway: 0,
    footRollL: 0,
    footRollR: 0
  };
};
