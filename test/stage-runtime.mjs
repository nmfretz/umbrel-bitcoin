import {cp} from 'node:fs/promises'

// Match Docker's runtime layout: the root package owns the #settings import map.
await cp('apps/backend/dist', 'dist', {recursive: true})
