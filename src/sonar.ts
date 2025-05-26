import { expandGlob } from '@std/fs'
import { Detector } from './detector.ts'

type Echo = {
  line: number
  fileName: string
  comment: string
  commentTag: string
}

class Sonar {
  #rootDir: string
  #ignorePaths: Array<string>
  #detector: Detector

  public static DEFAULT_COMMENT_TAGS = ['TODO', 'FIXME']
  public static DEFAULT_IGNORE_PATHS = [
    '.git',
  ]

  constructor(
    commentTags: Array<string>,
    rootDir: string,
    ignorePaths: Array<string> = [],
  ) {
    this.#rootDir = rootDir
    this.#ignorePaths = ignorePaths
    this.#detector = new Detector(commentTags)
  }

  public async scan(paths: Array<string>): Promise<{ echos: Array<Echo> }> {
    if (paths.length === 0) {
      throw new Error('No paths provided for scanning.')
    }

    const root = this.#rootDir
    const exclude = this.#ignorePaths
    const echos: Array<Echo> = []

    for (const pattern of paths) {
      for await (const file of expandGlob(pattern, { root, exclude })) {
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
