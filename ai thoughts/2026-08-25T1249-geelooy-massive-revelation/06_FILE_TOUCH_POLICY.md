B"H

# File Touch Policy

A source file is authorized for mutation only after its complete current contents, dependencies, current dirty state, and external contract are understood.

New modules are preferred when they create real architectural boundaries. Existing files are rewritten only when needed to wire those boundaries or correct an observed defect.

Generated bundles, compressed artifacts, vendor assets, and unrelated dirty work are not hand-edited.
