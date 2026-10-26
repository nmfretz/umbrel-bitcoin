import assert from 'node:assert/strict'
import {test} from 'node:test'
import {setImmediate} from 'node:timers/promises'
import {subscribeWebSocket} from '../apps/ui/src/lib/ws.ts'

test('reconnects with a fresh token and stops reconnecting after unmount', async (t) => {
	let requests = 0
	let nextRetry
	let opened = 0
	const sockets = []
	const originalLocation = globalThis.location
	globalThis.location = {origin: 'https://test.local'}
	t.after(() => {
		if (originalLocation === undefined) delete globalThis.location
		else globalThis.location = originalLocation
	})
	t.mock.method(globalThis, 'fetch', async () => ({ok: true, json: async () => ({token: `token-${++requests}`})}))
	t.mock.method(globalThis, 'setTimeout', (callback) => {
		nextRetry = callback
		return 1
	})
	t.mock.method(globalThis, 'clearTimeout', () => {
		nextRetry = undefined
	})
	const originalWebSocket = globalThis.WebSocket
	t.after(() => {
		globalThis.WebSocket = originalWebSocket
	})
	globalThis.WebSocket = class {
		constructor(url) {
			this.url = url
			sockets.push(this)
		}
		close() {
			this.onclose?.()
		}
	}
	const close = subscribeWebSocket(
		'/blocks',
		() => {},
		() => {
			opened++
		},
	)
	await setImmediate()
	assert.equal(sockets[0].url, 'wss://test.local/api/ws/blocks?token=token-1')
	sockets[0].onopen()
	sockets[0].close()
	await nextRetry()
	assert.equal(sockets[1].url, 'wss://test.local/api/ws/blocks?token=token-2')
	sockets[1].onopen()
	assert.equal(opened, 2)
	close()
	assert.equal(nextRetry, undefined)
	assert.equal(requests, 2)
})

test('unmount cancels token retrieval without creating a late socket', async (t) => {
	let pending
	let signal
	let connections = 0
	t.mock.method(globalThis, 'fetch', (_url, options) => {
		signal = options.signal
		return new Promise((resolve) => {
			pending = resolve
		})
	})
	const originalWebSocket = globalThis.WebSocket
	t.after(() => {
		globalThis.WebSocket = originalWebSocket
	})
	globalThis.WebSocket = class {
		constructor() {
			connections++
		}
	}
	const close = subscribeWebSocket('/transactions', () => {})
	close()
	assert.equal(signal.aborted, true)
	pending({ok: true, json: async () => ({token: 'late-token'})})
	await setImmediate()
	assert.equal(connections, 0)
})

test('an unavailable token endpoint retries with bounded backoff until it recovers', async (t) => {
	let attempts = 0
	let nextRetry
	const delays = []
	const originalLocation = globalThis.location
	globalThis.location = {origin: 'http://test.local'}
	t.after(() => {
		if (originalLocation === undefined) delete globalThis.location
		else globalThis.location = originalLocation
	})
	t.mock.method(globalThis, 'fetch', async () => {
		if (++attempts <= 7) return {ok: false, status: 503}
		return {ok: true, json: async () => ({token: 'recovered-token'})}
	})
	t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
		nextRetry = callback
		delays.push(delay)
		return 1
	})
	t.mock.method(globalThis, 'clearTimeout', () => {
		nextRetry = undefined
	})
	let socket
	const originalWebSocket = globalThis.WebSocket
	t.after(() => {
		globalThis.WebSocket = originalWebSocket
	})
	globalThis.WebSocket = class {
		constructor(url) {
			this.url = url
			socket = this
		}
		close() {
			this.onclose?.()
		}
	}
	const close = subscribeWebSocket('/transactions', () => {})
	t.after(close)
	await setImmediate()
	for (let retry = 0; retry < 7; retry++) await nextRetry()
	assert.deepEqual(delays, [1000, 2000, 4000, 8000, 16000, 32000, 32000])
	assert.equal(socket.url, 'ws://test.local/api/ws/transactions?token=recovered-token')
	socket.onopen()
	socket.close()
	assert.equal(delays.at(-1), 1000)
})
