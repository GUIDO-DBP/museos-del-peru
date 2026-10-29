import { rmSync } from 'node:fs'
// Only generated build output; never touch source files.
rmSync(new URL('../dist/', import.meta.url), { recursive: true, force: true })
