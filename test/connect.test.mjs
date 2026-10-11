import assert from 'node:assert/strict'
import {after, test} from 'node:test'
import {mkdtemp, writeFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {getConnectionDetails} from '../dist/modules/connect/connect.js'

const directory = await mkdtemp(path.join(tmpdir(), 'roots-connect-'))
after(() => rm(directory, {recursive: true, force: true}))

test('connection details discover new onion files without restarting the backend', async () => {
	process.env.P2P_HIDDEN_SERVICE_FILE = path.join(directory, 'p2p')
	process.env.RPC_HIDDEN_SERVICE_FILE = path.join(directory, 'rpc')
	assert.equal((await getConnectionDetails()).p2p.tor.host, 'notyetset.onion')
	const hostname = `${'a'.repeat(56)}.onion`
	await writeFile(process.env.P2P_HIDDEN_SERVICE_FILE, `${hostname}\n`)
	await writeFile(process.env.RPC_HIDDEN_SERVICE_FILE, `${hostname}\n`)
	const details = await getConnectionDetails()
	assert.equal(details.p2p.tor.host, hostname)
	assert.equal(details.rpc.tor.host, hostname)
	assert.equal(details.p2p.tor.uri, `${hostname}:8333`)
	await writeFile(process.env.P2P_HIDDEN_SERVICE_FILE, 'not-an-onion')
	assert.equal((await getConnectionDetails()).p2p.tor.host, 'notyetset.onion')
})

test('existing deployments can still supply onion hostnames through environment variables', async () => {
	delete process.env.P2P_HIDDEN_SERVICE_FILE
	delete process.env.RPC_HIDDEN_SERVICE_FILE
	process.env.P2P_HIDDEN_SERVICE = `${'b'.repeat(56)}.onion`
	process.env.RPC_HIDDEN_SERVICE = `${'c'.repeat(56)}.onion`
	const details = await getConnectionDetails()
	assert.equal(details.p2p.tor.host, process.env.P2P_HIDDEN_SERVICE)
	assert.equal(details.rpc.tor.host, process.env.RPC_HIDDEN_SERVICE)
})
