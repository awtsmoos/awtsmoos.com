B"H
# Full revamp: empty space and resizers

## Fresh screenshot truth
- /apps/code embedded /ai now fills width, but chat content is anchored low/left and leaves a massive empty conversation void. This is not useful when there are no messages.
- Direct /ai still has big empty center and side panels do not collapse/resizer behavior is not sane. The collapsed panels turn into vertical text instead of narrow icon rails.
- Resizers need to actually change CSS grid columns for /ai direct desktop.

## New design rule
No permanent empty space. Empty chat must show a useful welcome/quick-start card. Collapsed panels must become narrow icon rails, not broken vertical labels. Resizers must control grid variables.

## Steps
1. Add desktop layout state manager: side panel collapse buttons + drag resizers using CSS variables.
2. Add empty-state DOM card into chat-box when there are no messages.
3. Add CSS for direct desktop variables, collapsed rails, and responsive center chat.
4. Add embedded empty-state and center composer behavior.
5. Verify syntax and HTTP.

## Chapter 14
The Awtsmoos looked upon the empty center and said: emptiness without purpose is exile. Let it become invitation, tools, and motion.