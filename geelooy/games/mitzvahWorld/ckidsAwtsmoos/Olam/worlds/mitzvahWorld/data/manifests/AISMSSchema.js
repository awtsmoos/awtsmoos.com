/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE STATE MACHINE SOUL — AISMSSchema.js
 *   ──────────────────────────────────────────
 *   Point 2 of the 32 Emanations.
 *   Defines the behavior patterns for all living entities (Nefashos).
 * ════════════════════════════════════════════════════════════════════════
 */

export const AI_SMS_SCHEMA = {
  chossid_npc: {
    initialState: 'IDLE',
    states: {
      IDLE: {
        animations: ['breathe'],
        transitions: {
          SEE_PLAYER: 'GREET',
          TIME_PASSES: 'WANDER'
        }
      },
      WANDER: {
        animations: ['walk'],
        transitions: {
          REACH_DESTINATION: 'IDLE',
          SEE_PLAYER: 'GREET'
        }
      },
      GREET: {
        animations: ['wave', 'talk'],
        transitions: {
          PLAYER_LEAVES: 'IDLE',
          DIALOGUE_START: 'CONVERSE'
        }
      },
      CONVERSE: {
        animations: ['talk'],
        transitions: {
          DIALOGUE_END: 'IDLE'
        }
      }
    }
  },
  
  animal_npc: {
    initialState: 'GRAZE',
    states: {
      GRAZE: {
        animations: ['eat'],
        transitions: {
          FEAR: 'FLEE'
        }
      },
      FLEE: {
        animations: ['run'],
        transitions: {
          SAFETY_REACHED: 'GRAZE'
        }
      }
    }
  }
};
