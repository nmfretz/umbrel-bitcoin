import assert from 'node:assert/strict'
import {test} from 'node:test'
import {DefaultValuesForVersion, resolveVersion, schemaForVersion} from '../libs/settings/dist/index.js'

const version = resolveVersion('latest')
const defaults = DefaultValuesForVersion(version)
const schema = schemaForVersion(version)

test('Roots defaults and saved settings survive the validation-library update', () => {
	const result = schema.parse(defaults)
	assert.equal(result.datacarriersize, 83)
	assert.equal(result.minrelaytxfee, 1)
	assert.equal(result.permitbaremultisig, false)
	assert.deepEqual(schema.parse({...result, dbcache: 512, ipc: true}), {...result, dbcache: 512, ipc: true})
})

test('invalid numeric, boolean and network settings remain rejected', () => {
	for (const patch of [{dbcache: '512'}, {ipc: 'true'}, {onlynet: []}, {chain: 'invalid'}, {datacarriersize: -1}]) {
		assert.equal(schema.safeParse({...defaults, ...patch}).success, false)
	}
})

test('oversized network selections fail without accumulating one error per element', () => {
	const result = schema.safeParse({...defaults, onlynet: Array(100_000).fill('invalid')})
	assert.equal(result.success, false)
	assert.equal(result.error.issues.length, 1)
	assert.equal(result.error.issues[0].code, 'too_big')
})
