/**
 * B"H
 * @module DeclarationIndex
 * @description Final Vidui Maaser declaration lines as unlockable story gates.
 */
export const DeclarationLines = [
  { id: 'removed_house', text: 'I removed the holy from the house.', requires: ['secondResolved'] },
  { id: 'gave_levi', text: 'I gave it to the Levite.', requires: ['leviGiven'] },
  { id: 'gave_poor', text: 'I gave it to the stranger, orphan, and widow.', requires: ['poorGiven'] },
  { id: 'not_forgotten', text: 'I did not forget to bless and mention the Name.', requires: ['blessingRemembered'] },
  { id: 'rejoiced_shared', text: 'I rejoiced and made others rejoice.', requires: ['joyShared'] },
  { id: 'fruit_flavor', text: 'Look down from heaven and give flavor to the fruit.', requires: ['bikkurimGiven', 'terumahGiven'] }
];
export const declarationLineById = id => DeclarationLines.find(line => line.id === id) || null;
