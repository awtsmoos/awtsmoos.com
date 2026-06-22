/** B"H @module PortalIndexRambam */
export const RambamPortals = {
  Overworld_Main: [
    { edge: 'E', to: 'Rambam_Garden', spawn: { x: 2, y: 5 }, message: 'Entered the Garden of Ungiven Things.' }
  ],
  Rambam_Garden: [
    { edge: 'E', to: 'Rambam_RecipientCourt', spawn: { x: 2, y: 6 }, message: 'Entered the Court of Rightful Receivers.' },
    { edge: 'W', to: 'Overworld_Main', spawn: { x: 24, y: 5 }, message: 'Returned to the first village.' }
  ],
  Rambam_RecipientCourt: [
    { edge: 'E', to: 'House_Of_Forgetting', spawn: { x: 2, y: 6 }, message: 'Entered the House of Forgetting.' },
    { edge: 'W', to: 'Rambam_Garden', spawn: { x: 25, y: 5 }, message: 'Returned to the gift garden.' }
  ],
  House_Of_Forgetting: [
    { edge: 'W', to: 'Rambam_RecipientCourt', spawn: { x: 25, y: 6 }, message: 'Returned to the receiver court.' }
  ]
};
