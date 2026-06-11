/** B"H — semantic body anchors: hands, feet, center, and weapon-tip. */
export function anchors(f){ const b=f.bones; const hand=b.rightLowerArm?.tip||{x:f.x,y:f.y}; const foot=b.rightCalf?.tip||{x:f.x,y:f.y}; return { center:{x:f.x,y:f.y-38}, rightHand:hand, rightFoot:foot, weaponTip:f.heldWeapon?{x:hand.x+f.face*f.heldWeapon.range,y:hand.y}:hand }; }
