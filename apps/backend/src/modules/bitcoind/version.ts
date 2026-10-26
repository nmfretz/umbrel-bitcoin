export function parseBinaryVersion(output: string): {implementation: string; version: string} {
	const firstLine = output.split('\n')[0] ?? ''
	const implementation = firstLine.replace(/(?:daemon|RPC client)?\s*version.*$/i, '').trim()
	// Roots uses two numeric components and a release suffix (v30.3-roots.1).
	const version = firstLine.match(/\bv\d+\.\d+(?:\.\d+)?(?:[-+][0-9A-Za-z.-]+)?\b/)?.[0] ?? 'unknown'
	return {implementation: implementation || 'unknown', version}
}
