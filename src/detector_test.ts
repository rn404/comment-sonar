import { assertEquals } from '@std/assert'
import { Detector } from './detector.ts'

Deno.test('Detector: basic detection', () => {
  const tags = ['TODO', 'FIXME']
  const detector = new Detector(tags)

  const code = `
    // TODO: Refactor this function
    const x = 42; // FIXME: Magic number
  `

  const result = detector.exec(code)

  assertEquals(result.length, 2)
  assertEquals(result[0], {
    commentTag: 'TODO',
    comment: 'Refactor this function',
    line: 2,
  })
  assertEquals(result[1], {
    commentTag: 'FIXME',
    comment: 'Magic number',
    line: 3,
  })
})

Deno.test('Detector: test.ts file detection', async () => {
  const tags = ['TODO', 'FIXME']
  const detector = new Detector(tags)

  const filePath = './sample/test.ts'
  const code = await Deno.readTextFile(filePath)

  const result = detector.exec(code)

  assertEquals(result.length, 5)

  assertEquals(result[0], {
    commentTag: 'TODO',
    comment: 'この関数を最適化する',
    line: 1,
  })
  assertEquals(result[1], {
    commentTag: 'FIXME',
    comment: 'エラーハンドリングを追加する',
    line: 6,
  })
  assertEquals(result[2], {
    commentTag: 'TODO',
    comment: 'この関数を最適化する',
    line: 20,
  })
  assertEquals(result[3], {
    commentTag: 'TODO',
    comment: 'Use a more descriptive name',
    line: 29,
  })
  assertEquals(result[4], {
    commentTag: 'TODO',
    comment:
      '40文字以上の長いコメントをテストする. この関数は1から100までの数値を処理...',
    line: 33,
  })
})
