import {useEffect, useState} from 'react'

import {subscribeWebSocket} from '@/lib/ws'

export function useTransactionSocket(): number {
	const [txCount, setTxCount] = useState(0)

	useEffect(() => {
		return subscribeWebSocket('/transactions', (e) => {
			try {
				// The backend sends one “txPing” frame every 33 ms, with
				// `count` = number of transactions in that slice.
				const {type, count = 1} = JSON.parse(e.data)
				if (type === 'txPing') setTxCount((t) => t + count)
			} catch {
				// fallback for unexpected payloads
				setTxCount((t) => t + 1)
			}
		})
	}, [])

	return txCount
}
