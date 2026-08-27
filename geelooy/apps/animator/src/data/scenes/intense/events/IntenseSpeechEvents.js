
// B"H
/**
 * @file IntenseSpeechEvents.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 12: THE DIALOGUE OF EXISTENCE (Sichat HaKiyum)
 * ============================================================================
 * Sound must have order. When one speaks, the other listens. 
 * This is the foundation of cinematic reality. We stagger the events precisely 
 * so the `SpeechKinetics` and `VocalSystem` evaluate one voice at a time.
 * ============================================================================
 */

export const IntenseSpeechEvents = [
  // HUSBAND (3s - 8s): Nervous and questioning
  { 
    type: 'speech', id: 'c1_husband', 
    start: 3000, end: 8000, 
    speech: "Why do I feel like my very existence is a simulation? Like my jaw is just a mathematical hinge!" 
  },
  
  // WIFE (8.5s - 12s): Calm, dismissive
  { 
    type: 'speech', id: 'c2_wife', 
    start: 8500, end: 12000, 
    speech: "You're overthinking it again, dear. Just relax and trim the bonsai." 
  },

  // HUSBAND (12.5s - 16s): Escalating anger + Lifting the Tree
  { 
    type: 'speech', id: 'c1_husband', 
    start: 12500, end: 16000, 
    speech: "Bonsai?! Look at this! I am holding an entire palm tree with one hand! My physics are completely arbitrary!" 
  },

  // WIFE (16.5s - 20s): Amused resolution
  { 
    type: 'speech', id: 'c2_wife', 
    start: 16500, end: 20000, 
    speech: "Well, at least the Awtsmoos gave you good upper body strength. Please put the tree down." 
  }
];
