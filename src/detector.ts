class Detector {
  #pattern: RegExp
  #regexpFlags: string = 'm'

  public static TAG_PATTERN_FILLER = '{{tags}}'
  public static MAX_CHAR_LENGTH = 40

  constructor(tags: Array<string>) {
    const joinedTags = tags.join('|')
    this.#pattern = new RegExp(
      /({{tags}})\b[:\-]?\s*(.*)/.source.replace(
        Detector.TAG_PATTERN_FILLER,
        joinedTags,
      ),
      this.#regexpFlags,
    )
  }

  private extractLines(text: string): Array<string> {
    const separator = /\r\n|\n|\r/
    return text.split(separator)
  }

  private tidy(text: string): string {
    if (text.length > Detector.MAX_CHAR_LENGTH) {
      return text.slice(0, Detector.MAX_CHAR_LENGTH).trim() + '...'
    }

    return text.trim()
  }

  private detect(
    line: string,
  ): { comment: string; commentTag: string; charAt: number } | undefined {
    const pattern = this.#pattern
    const matches = pattern.exec(line)

    if (matches === null) return undefined

    const { 1: commentTag, 2: comment, index: charAt } = matches
    return { comment: this.tidy(comment), commentTag, charAt }
  }

  public exec(
    text: string,
  ): Array<{ commentTag: string; comment: string; line: number }> {
    const lines = this.extractLines(text)

    const echos: ReturnType<Detector['exec']> = lines.map(
      (line, index) => {
        if (line.trim() === '') return

        const detected = this.detect(line)

        if (detected === undefined) return

        return {
          commentTag: detected.commentTag,
          comment: detected.comment,
          line: index + 1,
        }
      },
    )
      .filter((echo) => echo !== undefined)

    return echos
  }
}

export { Detector }
