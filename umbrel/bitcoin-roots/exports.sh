#!/usr/bin/env bash
# Sourced by umbrelOS; do not change shell options in the caller.
export APP_BITCOIN_ROOTS_NODE_IP="10.21.120.8"
export APP_BITCOIN_ROOTS_TOR_IP="10.21.120.9"
export APP_BITCOIN_ROOTS_I2P_IP="10.21.120.10"
export APP_BITCOIN_ROOTS_RPC_USER="umbrel"
# Use exports-time context so these remain correct when sourced as a dependency.
: "${app_entropy_identifier:?Umbrel exports context is required}"
APP_BITCOIN_ROOTS_RPC_PASS=$(derive_entropy "${app_entropy_identifier}-rpc-password") || return 1
APP_BITCOIN_ROOTS_TOR_PASSWORD=$(derive_entropy "${app_entropy_identifier}-tor-password") || return 1
export APP_BITCOIN_ROOTS_RPC_PASS APP_BITCOIN_ROOTS_TOR_PASSWORD
