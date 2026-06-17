// B"H
export function installerReport(result = {}) { return { installedObjects:result.objects?.length || 0, sefirosPackets:result.sefiros?.sefiros?.items?.length || 0, id:result.id || null }; }
