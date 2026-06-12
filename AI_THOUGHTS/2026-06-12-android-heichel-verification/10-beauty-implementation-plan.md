B"H

# Beauty implementation pass plan

We now implement the 151-file beauty plan in a reversible layer.

Rules:
- Stable split modules stay.
- Beauty modules are imported last.
- JS beauty behaviors are defensive, optional, and no-crash.
- Templates are bumped to beauty-001 only after tests pass.

Implementation groups:
1. Create global foundation beauty modules.
2. Create home beauty modules and import them in home/index.css.
3. Create Heichel beauty modules and import them in Heichel/index.css.
4. Create reader beauty modules and import them in post main.css.
5. Add Heichel beauty JS.
6. Add reader beauty JS.
7. Rewrite app.js and postLogic.js to run beauty safely.
8. Add beauty tests.
9. Bump templates to beauty-001.
10. Run full old + new test wall and live inspect runtime.
