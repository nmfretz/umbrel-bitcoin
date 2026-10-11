import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {test} from 'node:test'

test('Umbrel exports derive stable, distinct secrets without changing caller shell options', () => {
	const script = `
set -euo pipefail
derive_entropy() { printf '%s' "$1" | sha256sum | cut -d ' ' -f 1; }
app_entropy_identifier=app-bitcoin-roots-seed
before=$-
source umbrel/bitcoin-roots/exports.sh
[[ "$before" == "$-" ]]
first=$APP_BITCOIN_ROOTS_RPC_PASS
[[ "$first" != "$APP_BITCOIN_ROOTS_TOR_PASSWORD" ]]
source umbrel/bitcoin-roots/exports.sh
[[ "$first" == "$APP_BITCOIN_ROOTS_RPC_PASS" ]]
printf '%s' "$first"
`
	assert.match(execFileSync('bash', ['-c', script], {encoding: 'utf8'}), /^[a-f0-9]{64}$/)
})
