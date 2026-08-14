B"H

Boruch Hashem

Blessed is He

# Accepted Private Room Live Browser Evidence

The Awtsmoos is beyond list, room, draft, detail, and viewport. This pass proved the ordinary accepted private conversation—the surface a human will live in every day—using the production list/thread/details renderers inside the real flagship shell rather than a parallel mock interface.

## Production fixture

A live local server was already running on port 8080 with Mail disabled. A clean Chrome target loaded the real flagship and imported the production owners:

- MessagingListView;
- MessagingThreadView;
- renderDirectDetails.

The browser fixture supplied transient authorized-room-shaped data only; it did not send or persist any private protocol mutation.

The fixture rendered:

- 18 conversation summaries;
- one selected direct room for Miriam Cohen;
- five private messages through the real message renderer;
- one visible private draft;
- direct-room details;
- a visible Older action.

Because the underlying real page was signed out, the authenticated fixture explicitly mirrored the state the real Chats section controller would own: list visible, New action visible, `Request a private chat` accessible name, and `New chat` visible label. This avoided conflating signed-out gating with authenticated layout geometry.

## Fixture correction discovered during proof

The first browser assertion reported a 0px selected row. A direct DOM diagnostic proved the product row itself was healthy:

- hidden=false;
- display=grid;
- aria-current=true;
- selected classes present;
- selected pseudo accent width=3px.

The parent `#messagingList` was still hidden because the transient fixture had bypassed the real section controller after previously visiting a special section. The fixture was corrected with the same state the real list controller uses: `list.hidden=false`.

A second failure at phone New was likewise fixture-state, not CSS: the real signed-out controller had hidden the private creation action. The authenticated fixture then explicitly applied the real Chats New state before measuring it.

No product file was changed for either fixture-only mismatch.

## Final desktop/tablet assertions

The final assertion worker ran the production fixture at:

- 1440×900;
- 1200×900;
- 1024×900;
- 900×900;
- 768×900.

At every width it required and passed:

- exactly ten visible rail labels;
- every rail label's scroll width <= client width, proving no truncation;
- selected conversation `aria-current=true`;
- selected accent >=3px;
- selected row height >=64px;
- thread header >=72px;
- Details >=40px;
- Older >=40px;
- Send >=44px;
- exactly five production-rendered private messages;
- composer visible;
- thread width >=300px;
- document horizontal overflow=false.

This closes the earlier wide-rail defect: the 148px desktop rail and 82px compact rail are now browser-proven readable across the full desktop/tablet range.

## Final phone assertions

The same live fixture then ran at:

- 390×844;
- 360×844.

Thread state required and passed:

- Back >=44px;
- Details >=44px;
- Send >=44px;
- thread pane visible;
- list pane hidden;
- horizontal overflow=false.

List state required and passed:

- New action >=44px;
- New accessible name exactly `Request a private chat`;
- selected row remains `aria-current=true`;
- horizontal overflow=false.

Details state required and passed:

- details close >=44px;
- details drawer width exactly equals the current viewport width;
- horizontal overflow=false.

## Final browser verdict

Final direct-CDP assertion job:

`cmdjob_msrp0tei_dd2546f25e22`

completed with exit code 0 and zero assertion output.

This is real browser runtime proof across desktop, tablet, and two phone widths.

## NEXT_ACTION

Use the same assertion-based browser method to prove loaded-workspace search cannot linger invisibly across real section navigation. Then continue through request/friend action geometry and a full post-latest social/UI regression freeze.
