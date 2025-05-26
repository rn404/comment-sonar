import { assertEquals } from '@std/assert'
import { Sonar } from './sonar.ts'

Deno.test('Sonar: class initialization', () => {
  const rootDir = Deno.cwd()
  const commentTags = Sonar.DEFAULT_COMMENT_TAGS
  const sonar = new Sonar(commentTags, rootDir)

  assertEquals(sonar instanceof Sonar, true)
})

Deno.test('Sonar: scan method', async () => {
  const rootDir = Deno.cwd()
  const commentTags = Sonar.DEFAULT_COMMENT_TAGS
  const paths = ['./sample/**/*.ts']
  const sonar = new Sonar(commentTags, rootDir)

  const { echos } = await sonar.scan(paths)

  assertEquals(Array.isArray(echos), true)
  assertEquals(echos.length > 0, true)

  // Example assertion, adjust based on actual sample files
  assertEquals(echos[0].commentTag, 'TODO')
  assertEquals(typeof echos[0].comment, 'string')
  assertEquals(typeof echos[0].line, 'number')
  assertEquals(typeof echos[0].fileName, 'string')
})
