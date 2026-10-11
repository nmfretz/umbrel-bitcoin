import assert from 'node:assert/strict'
import {after, test} from 'node:test'
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'

const directory = await mkdtemp(path.join(tmpdir(), 'roots-config-'))
Object.assign(process.env, {
	BITCOIN_DIR: path.join(directory, 'bitcoin'),
	APP_STATE_DIR: path.join(directory, 'app'),
	BITCOIND_BIN: '/bin/true',
	BITCOIND_IP: '10.21.120.8',
	TOR_HOST: '10.21.120.9',
	TOR_SOCKS_PORT: '9050',
	TOR_CONTROL_PORT: '9051',
	TOR_CONTROL_PASSWORD: 'testpassword',
	I2P_HOST: '10.21.120.10',
	I2P_SAM_PORT: '7656',
})
await mkdir(process.env.APP_STATE_DIR)
const {ensureConfig} = await import('../dist/modules/config/config.js')
after(() => rm(directory, {recursive: true, force: true}))

async function configure(settings) {
	await writeFile(path.join(process.env.APP_STATE_DIR, 'settings.json'), JSON.stringify(settings))
	await ensureConfig()
	return (await readFile(path.join(process.env.BITCOIN_DIR, 'umbrel-bitcoin.conf'), 'utf8')).split('\n')
}

test('default outgoing Tor uses the packaged SOCKS endpoint', async () => {
	const lines = await configure({})
	assert.ok(lines.includes('onlynet=onion'))
	assert.ok(lines.includes('onion=10.21.120.9:9050'))
	assert.ok(lines.includes('listenonion=0'))
	assert.ok(!lines.some((line) => line.startsWith('torpassword=')))
	assert.ok(!lines.some((line) => line.includes('undefined')))
})

test('incoming Tor configures control authentication and the onion listener', async () => {
	const lines = await configure({listen: ['tor']})
	for (const line of [
		'listenonion=1',
		'torcontrol=10.21.120.9:9051',
		'torpassword=testpassword',
		'bind=10.21.120.8:8334=onion',
	]) {
		assert.ok(lines.includes(line), line)
	}
})

test('clearnet proxy is opt-in and removed when Tor is disabled', async () => {
	let lines = await configure({proxy: true})
	assert.ok(lines.includes('proxy=10.21.120.9:9050'))
	lines = await configure({onlynet: ['clearnet'], listen: [], proxy: true})
	assert.ok(!lines.some((line) => /^(proxy|onion|torcontrol|torpassword)=/.test(line)))
	assert.ok(lines.includes('listenonion=0'))
})
