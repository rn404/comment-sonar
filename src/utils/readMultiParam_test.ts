import { assertEquals } from '@std/assert'
import { readMultiParam } from './readMultiParam.ts'

Deno.test('readMultiParam: empty input', () => {
  const input = ''
  const actual = readMultiParam(input)
  assertEquals(actual, [])
})

Deno.test('readMultiParam: single input', () => {
  const input = 'src/**/*.ts'
  const actual = readMultiParam(input)
  assertEquals(actual, ['src/**/*.ts'])
})

Deno.test('readMultiParam: single line input', () => {
  const input = 'param1,param2,param3'
  const actual = readMultiParam(input)
  assertEquals(actual, ['param1', 'param2', 'param3'])
})

Deno.test('readMultiParam: multi-line input', () => {
  const input = 'param1\nparam2\nparam3'
  const actual = readMultiParam(input)
  assertEquals(actual, ['param1', 'param2', 'param3'])
})
