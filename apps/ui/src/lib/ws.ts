export function subscribeWebSocket(path: string, onMessage: (event: MessageEvent) => void, onOpen?: () => void) {
	let socket: WebSocket | undefined
	let timer: ReturnType<typeof setTimeout> | undefined
	let retry = 0
	let cancelled = false
	const controller = new AbortController()

	const reconnect = () => {
		if (cancelled) return
		clearTimeout(timer)
		timer = setTimeout(open, 1_000 * 2 ** Math.min(retry++, 5))
	}
	const open = async () => {
		try {
			// The backend rotates this token on restart. Refresh it on every connection.
			const response = await fetch('/api/ws/token', {signal: controller.signal, cache: 'no-store'})
			if (!response.ok) throw new Error(`WebSocket token HTTP ${response.status}`)
			const {token} = await response.json()
			if (cancelled) return
			socket = new WebSocket(
				`${location.origin.replace(/^http/, 'ws')}/api/ws${path}?token=${encodeURIComponent(token)}`,
			)
			socket.onopen = () => {
				retry = 0
				onOpen?.()
			}
			socket.onmessage = (event) => {
				if (!cancelled) onMessage(event)
			}
			socket.onclose = reconnect
			socket.onerror = () => socket?.close()
		} catch {
			reconnect()
		}
	}
	void open()
	return () => {
		cancelled = true
		controller.abort()
		clearTimeout(timer)
		socket?.close()
	}
}
