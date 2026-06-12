from pathlib import Path
repls = {
'ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/LivingRegionRuntime.js': [
('try { olam?.ayshPeula?.("updateProgress", { livingRegionRuntimeStats: stats }); } catch {}', 'try { olam?.ayshPeula?.("updateProgress", { livingRegionRuntimeStats: stats }); globalThis.postMessage?.({ type: "livingRegionRuntimeStats", payload: { stats } }); } catch {}'),
('RegionColliderRuntime.js?v=merged-collider-20260612-bh1"', 'RegionColliderRuntime.js?v=merged-collider-20260612-bh1"')
],
'ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/MitzvahRegionDirector.js': [
("try { olam?.ayshPeula?.('updateProgress', { livingRegionDirectorReport: payload }); } catch {}", "try { olam?.ayshPeula?.('updateProgress', { livingRegionDirectorReport: payload }); globalThis.postMessage?.({ type: 'livingRegionDirectorReport', payload }); } catch {}")
],
'ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/MitzvahWorldPostBuild.js': [('full-region-runtime-diag-20260612-bh7','full-region-runtime-diag-20260612-bh8')],
'ckidsAwtsmoos/Olam/methods/loadNivrayim/index.js': [('full-region-postbuild-diag-20260612-bh7','full-region-postbuild-diag-20260612-bh8')],
'ckidsAwtsmoos/Olam/worlds/mitzvahWorld/WorldHeescheel.js': [('full-region-postbuild-diag-20260612-bh7','full-region-postbuild-diag-20260612-bh8')]
}
for p, rules in repls.items():
    path = Path(p); s = path.read_text()
    for a,b in rules: s = s.replace(a,b)
    path.write_text(s)
    print('patched', p)
