B"H
Boruch Hashem
Blessed is He

# Implementation Review — Mobile Gameplay and Interface Repair

The Awtsmoos revealed that each screenshot carried a real contract mismatch rather than one vague polish request. Awtsmoos.com now joins architecture, mobile touch, measured visibility, deliberate choice, and verified runtime truth.

## Original reported failures

1. Thin house walls disappeared at close mobile camera angles.
2. The Bag exposed only six equipment slots and hid real equipped garments.
3. Both tefillin were owned but not equipped by default.
4. Generated staff and sword attachments could remain hidden inside fallback models.
5. Releasing movement controls replaced the last travel orientation with a zero-input direction.
6. Demon color compression erased patterned hide detail.
7. Shlichus acceptance and tracking lacked story, choice, faces, and readable progress.
8. Teaching guidance could not be moved out of the side view.
9. Corpse interaction transferred all loot immediately instead of opening a deliberate window.

## Final architecture

### House visibility

Shared house materials remain neutral and front-sided. The role-specific surface policy grants reverse faces only to thin exterior wall roles:

- exterior front wall
- exterior front header
- exterior back wall
- exterior side wall

Those meshes disable backface culling and frustum disappearance. Floors, roofs, foundations, thresholds, supports, and interior solids remain front-sided. This preserves collision depth and winding while preventing camera clipping from erasing a wall.

### Equipment truth

A canonical fourteen-slot equipment contract now drives the Bag:

- hat
- kippah
- tefillin shel rosh
- eyes
- tefillin shel yad
- coat
- outer shirt
- inner shirt
- trousers
- shoes
- main hand
- off hand
- tool
- accessory

Both tefillin are present in default equipment. The tefillin-aware jacket variant is selected when appropriate. Equipped staff or sword begins visibly drawn and attaches to the right hand, with a model-root fallback when named bones are unavailable.

### Movement release

Travel facing changes only when a nonzero movement step exists. A released joystick therefore preserves both the current position and the last meaningful travel yaw.

### Demon readability

Demon materials preserve procedural texture maps and profile distinctions while enforcing a post-clamp luminance safety floor of 0.345. Channels remain bounded between 0.14 and 0.66. Emissive strength remains a restrained 0.06, preventing neon silhouettes while revealing the patterned hide.

### Shlichus presentation

The mission is now Five Shadows Before Sunset:

- five distinct demons
- five visible face pips
- numerical slain count
- percentage and progress bar
- expanded opening story
- danger, purpose, and road counsel
- named giver and title
- promised reward seal
- deliberate accept, decline, return, and continue actions

Teaching placement is persisted as either side guidance or book only. Moving guidance into the book hides the tracker while retaining the entire story and counsel in the parchment.

### Corpse recovery

Each enemy owns a remaining-loot state. The corpse lifecycle is now:

1. Select corpse.
2. Open loot window.
3. Inspect item icons, names, categories, and quantities.
4. Take one chosen stack or use Loot All.
5. Leave any unclaimed stacks on the visible corpse.
6. Hide and complete the corpse only after the final stack is taken.

The modal disables world controls while open and supplies mobile-sized Close, Take, Leave Items, and Loot All actions.

## Integration repairs discovered during simulation

The complete Node world exposed and repaired three migration gaps:

- missing enemy receipt support module
- wrong singular/plural enemy profile import
- dropped cycleTarget population method required by defeat locks

Feature failure receipts now preserve stack traces so later deferred failures remain diagnosable.

## Verification philosophy

The repair was not accepted from static markup alone. It was checked through:

- direct behavioral contracts
- migrated legacy contracts
- complete browserless launcher execution
- real 390 × 844 mobile WebGL Chrome
- actual Bag and Shlichus DOM controls
- real enemy defeat, selective Take, and Loot All interactions
- browser exception, console, HTTP, and request-failure evidence

No commit or push was performed.
