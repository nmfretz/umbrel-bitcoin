import assert from 'node:assert/strict'
import {after, test} from 'node:test'
import {mkdtemp, writeFile, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'

const directory = await mkdtemp(path.join(tmpdir(), 'roots-migration-'))
process.env.APP_STATE_DIR = directory
const {migrateLegacyConfig} = await import('../dist/modules/config/migration.js')
after(() => rm(directory, {recursive: true, force: true}))

const legacyPath = path.join(directory, 'bitcoin-config.json')
const settingsPath = path.join(directory, 'settings.json')

test('invalid legacy settings report the field and leave the original file intact', async () => {
	const legacy = {clearnet: true, network: 'mainnet'}
	await writeFile(legacyPath, JSON.stringify(legacy))
	await assert.rejects(migrateLegacyConfig, /Validation of legacy config failed.*chain:/)
	assert.deepEqual(JSON.parse(await readFile(legacyPath, 'utf8')), legacy)
	await assert.rejects(readFile(settingsPath), {code: 'ENOENT'})
})

test('legacy settings migrate with typed values and keep their backup', async () => {
	const legacy = {clearnet: true, tor: true, network: 'regtest', cacheSizeMB: '512', peerbloomfilters: 'false'}
	await writeFile(legacyPath, JSON.stringify(legacy))
	const result = await migrateLegacyConfig()
	assert.equal(result.chain, 'regtest')
	assert.equal(result.dbcache, 512)
	assert.equal(result.peerbloomfilters, false)
	assert.deepEqual(result.onlynet, ['clearnet', 'tor'])
	assert.deepEqual(JSON.parse(await readFile(settingsPath, 'utf8')), result)
	assert.deepEqual(JSON.parse(await readFile(`${legacyPath}.bak`, 'utf8')), legacy)
	assert.equal(await migrateLegacyConfig(), undefined)
})
