import assert from 'node:assert/strict'
import {test} from 'node:test'
import {parseBinaryVersion} from '../dist/modules/bitcoind/version.js'

test('reports the complete Roots version for monolithic and IPC binaries', () => {
	for (const binary of ['bitcoind', 'bitcoin-node']) {
		assert.deepEqual(parseBinaryVersion(`Bitcoin Roots daemon version v30.3-roots.1 ${binary}\nCopyright`), {
			implementation: 'Bitcoin Roots',
			version: 'v30.3-roots.1',
		})
	}
})

test('version parsing preserves three-component versions and handles missing output', () => {
	assert.deepEqual(parseBinaryVersion('Bitcoin Core daemon version v30.0.0'), {
		implementation: 'Bitcoin Core',
		version: 'v30.0.0',
	})
	assert.deepEqual(parseBinaryVersion(''), {implementation: 'unknown', version: 'unknown'})
})
