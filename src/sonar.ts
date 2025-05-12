import { expandGlob } from '@std/fs'
import { Detector } from './detector.ts'

type Echo = {
  line: number
  fileName: string
  comment: string
  commentTag: string
}

class Sonar {
  #detector: Detector
  #ignorePaths: Array<string>

  public static DEFAULT_COMMENT_TAGS = ['TODO', 'FIXME']
  public static DEFAULT_IGNORE_PATHS = [
    '.git',
  ]

  constructor(
    commentTags: Array<string>,
    ignorePaths: Array<string> = [],
  ) {
    this.#detector = new Detector(commentTags)
    this.#ignorePaths = ignorePaths
  }

  public async scan(paths: Array<string>): Promise<{ echos: Array<Echo> }> {
    if (paths.length === 0) {
      throw new Error('No paths provided for scanning.')
    }

    const ignorePaths = this.#ignorePaths
    const echos: Array<Echo> = []

    for (const pattern of paths) {
      for await (const file of expandGlob(pattern, { exclude: ignorePaths })) {
        if (!file.isFile) continue

        const fileText = await Deno.readTextFile(file.path)
        const result: Array<Echo> = this.#detector.exec(fileText).map(
          (echo) => {
            return { fileName: file.path, ...echo }
          },
        )
        echos.push(...result)
      }
    }

    return { echos }
  }
}

export { Sonar }
export type { Echo }
