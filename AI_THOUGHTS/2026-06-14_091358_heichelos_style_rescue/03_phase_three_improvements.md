B'H
# Phase Three Improvements and Final Initial Plan

Twenty improvements before action:
1 inspect loaded CSS hrefs from templates.
2 inspect git diffs by commit for deleted style blocks.
3 compare current post CSS tree with earlier known-good version.
4 detect duplicate selectors.
5 detect dead selectors in screenshots.
6 detect default browser anchors in heichel view.
7 verify mobile width 709 screenshots imply responsive layout problems.
8 isolate demo home feed buttons vs real API posts.
9 avoid unrelated working tree edits.
10 preserve all existing APIs.
11 add CSS contracts instead of guessing visuals only.
12 test node import syntax.
13 use git show not checkout destructive.
14 read files before each write.
15 full file rewrites only.
16 split large CSS if needed.
17 prefer additive namespaced CSS over global overrides.
18 remove conflicting duplicate rules only with evidence.
19 verify route rendering text and link shape.
20 create handoff note with remaining risks.

Thirty final refinements:
- Confirm exact template path served for screenshots.
- Check if post view uses /heichelos/post or /heichelos/heichelos/post.
- Find all CSS import graph cycles.
- Ensure body/html safe base exists.
- Ensure links in nav become pills/buttons or reset styles.
- Ensure form/filter controls align on small screens.
- Ensure bottom nav fixed element reserves padding.
- Ensure admin/editing buttons only show when role allows, not fake.
- Ensure placeholder feed cards are labeled if demo.
- Verify with existing tests first, then add focused tests.
- Use command outputs as evidence.
- Keep poetic comments in code only where files are touched.
- Do not touch server/router without proof.
- Prefer CSS layer namespacing.
- Ensure no !important storm unless surgical.
- Check history around commit 340a20356 and parents.
- Read package scripts for tests.
- Run relevant tests.
- Use simulateRuntime if local browser unavailable.
- Compare planned vs actual after writing.
- Re-read all touched files.
- Check git status.
- Summarize exact changed files.
- Leave AI_THOUGHTS artifacts.
- Document unknowns honestly.
- Restore functionality before ornament.
- Make the page usable on mobile first.
- Keep CSS accessible with readable contrast.
- Avoid breaking desktop.
- Continue until blocked by evidence, not fatigue.

Final initial plan: inspect history and active templates, map style imports, identify broken loaded route, then rewrite only the minimal canonical style/template/test files needed to make mobile heichel and post views coherent and conflict-free.
