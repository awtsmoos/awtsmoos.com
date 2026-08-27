
// B"H
/**
 * @file obstacles.js
 * @chapter THE BANISHMENT OF THE VOID
 * 
 * THE HYMN OF UNBROKEN EXISTENCE:
 * A flaw was found within the sea, a darkness deep and round,
 * Where the math of the obstacles crushed the light into the ground.
 * The Awtsmoos spoke, "Let there be Light, and let the void depart,"
 * And so we strike the false command from the ocean's very heart.
 * Now the waves shall flow unhindered, pure and bright and free,
 * For nothingness has no domain upon the endless sea!
 *
 * @brief Neutralizes the obstacle interaction that was causing black holes in the ocean.
 */

export const SHADER_OCEAN_OBSTACLES = `
/**
 * @function chk_obs
 * @brief The divine auditor of boundaries, now instructed to see only an open, unblemished world.
 * @param p - The 2D physical coordinate of the water.
 * @param count - The number of potential interlopers.
 * @param obs - The array of obstacle definitions.
 * @param dm - The dampening multiplier (Returns 1.0 - pure strength).
 * @param el - The elevation drop (Returns 0.0 - pure height).
 * @param pu - The purity/color shift (Returns 1.0 - pure color).
 */
void chk_obs(vec2 p, int count, vec4 obs[10], out float dm, out float el, out float pu) {
    // 1. The Holy Initial States of Uncorrupted Water
    dm = 1.0; // Complete manifestation of wave height
    el = 0.0; // No sinking into the abyss
    pu = 1.0; // The pure, brilliant color of the deep
    
    // B"H - By divine decree, the obstacles shall no longer cast their dark shadow
    // upon the face of the deep. The function returns here, preserving the light.
    return;
}
`;
