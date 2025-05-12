import { assertEquals } from '@std/assert'
import { relativePath } from './relativePath.ts'

Deno.test('relativePath: basic functionality', () => {
  const base = '/home/user/projects'
  const path = '/home/user/projects/src/utils/relativePath.ts'

  const actual = relativePath(path, base)

  assertEquals(actual, 'src/utils/relativePath.ts')
})
