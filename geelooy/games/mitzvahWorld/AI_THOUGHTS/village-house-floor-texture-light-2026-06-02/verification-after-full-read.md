B"H

# Verification After Full Relevant Read

I re-read the full current contents of:
- levels/ladder/data/village.json
- ckidsAwtsmoos/dvarim/nature/villagePicture/cottageRecipe.js
- ckidsAwtsmoos/dvarim/nature/villagePicture/geometryKit.js
- ckidsAwtsmoos/dvarim/nature/VillageHouseCollider.js
- ckidsAwtsmoos/dvarim/nature/VillageHouseDoor.js
- ckidsAwtsmoos/dvarim/nature/VillagePictureProp.js
- ckidsAwtsmoos/dvarim/nature/villagePicture/recipeMap.js
- ckidsAwtsmoos/dvarim/nature/villagePicture/palette.js

Important correction discovered:
The visual cottage is a VillagePictureProp scaled by 4.8. The visual floor cube in cottageRecipe has local top at approximately 0.07, meaning visible world floor top is approximately 0.336. My previous collider floorTop=0.08 is too low, because I treated the cottage local y as if it were unscaled. The earlier 0.4 was likely too high by about 0.064, which matches the floating report. Correct target should be close to 0.34.

Next correction:
- Rewrite VillageHouseCollider.js fully so default floorTop is 0.34.
- Make threshold collider top align close to visual threshold stone top, without blocking the doorway.
- Rewrite village.json fully through JSON serialization setting floorTop to 0.34.
- Re-run syntax and JSON verification.
