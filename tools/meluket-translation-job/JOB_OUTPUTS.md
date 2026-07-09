B"H

# Meluket job output location

Generated translation, validation, raw XML, swarm progress, import backups, and other run artifacts are intentionally kept outside this git repository.

Default external job root:

```bash
/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job
```

Override when needed:

```bash
AWTSMOOS_JOB_ROOT=/some/external/path node tools/meluket-translation-job/runMeluketSwarm.js --run
```

The repository should contain scripts only, not generated job output.
