import {useEffect} from 'react'
import {useQueryClient} from '@tanstack/react-query'

import {subscribeWebSocket} from '@/lib/ws'
import {useSyncStatus} from './useSyncStatus'
import {syncStage} from '@/lib/sync-progress'

import type {Block} from '#types'

// Single global WebSocket for real-time block updates.
// Call once in the app shell (Layout). On new block, updates every
// ['rpc', 'blocks', *] query cache so all consumers (home page cubes,
// insights charts) stay in sync without their own WebSocket connections.

export function useBlockStream() {
	const qc = useQueryClient()
	const {data: syncStatus} = useSyncStatus()
	const stage = syncStage(syncStatus)

	useEffect(() => {
		if (stage !== 'synced') return
		return subscribeWebSocket(
			'/blocks',
			(event) => {
				try {
					const block: Block = JSON.parse(event.data)
					qc.setQueriesData<Block[]>({queryKey: ['rpc', 'blocks']}, (old) => {
						if (!old) return old
						if (old.some((b) => b.hash === block.hash)) return old
						return [...old, block].sort((a, b) => a.height - b.height).slice(-Math.max(old.length, 1))
					})
				} catch {
					/* ignore bad JSON */
				}
			},
			() => {
				// Catch up on blocks received while the app or connection was offline.
				void qc.invalidateQueries({queryKey: ['rpc', 'blocks']})
			},
		)
	}, [stage, qc])
}
