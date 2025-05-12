const DefaultIssueOptions = {
  title: ':pushpin: TODO/FIXME List',
  body: {
    existingIssue: 'The following TODO/FIXME comments were found:\n\n',
    noIssues: 'No TODO/FIXME comments were found.',
  },
  label: 'TODO',
}

class GithubIssueClient {
  #apiBase: string
  #headers: {
    Authorization: string
    Accept: string
    'Content-Type': string
  }
  #issueOptions: typeof DefaultIssueOptions
  #repositoryUrl: string

  public static DEFAULT_ISSUE_OPTIONS = DefaultIssueOptions

  constructor(
    /**
     * GitHub access token
     */
    token: string,
    /**
     * GitHub repository in the format "owner/repo"
     */
    repo: string,
    /**
     * Optional issue options
     */
    private issueOptions: typeof DefaultIssueOptions,
  ) {
    const [owner, name] = repo.split('/')
    this.#apiBase = `https://api.github.com/repos/${owner}/${name}/issues`
    this.#headers = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    }
    this.#issueOptions = { ...issueOptions }
    this.#repositoryUrl = `https://github.com/${owner}/${name}/blob/`
  }

  private async checkExistingIssue(): Promise<
    { issueNumber: number } | undefined
  > {
    const apiBase = this.#apiBase
    const headers = this.#headers
    const issueTitle = this.#issueOptions.title
    const issueLabel = this.#issueOptions.label

    const url = new URL(apiBase)
    url.searchParams.append('state', 'open')
    url.searchParams.append('labels', issueLabel)
    const response = await fetch(url.toString(), { headers })
    const issues = await response.json()

    // deno-lint-ignore no-explicit-any
    const matchedIssue = issues.find((issue: any) => issue.title === issueTitle)

    return matchedIssue === undefined || matchedIssue === null
      ? undefined
      : { issueNumber: matchedIssue.number }
  }

  private async update(issueNumber: number, todos: Array<string>) {
    const apiBase = this.#apiBase
    const headers = this.#headers
    const { existingIssue, noIssues } = this.#issueOptions.body

    await fetch(`${apiBase}/${issueNumber}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        body: todos.length > 0
          ? `${existingIssue}${todos.join('\n')}`
          : noIssues,
      }),
    })
  }

  private async create(todos: Array<string>) {
    const apiBase = this.#apiBase
    const headers = this.#headers
    const { title, label } = this.#issueOptions
    const { existingIssue, noIssues } = this.#issueOptions.body

    const createResponse = await fetch(apiBase, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title,
        body: todos.length > 0
          ? `${existingIssue}${todos.join('\n')}`
          : noIssues,
        labels: [label],
      }),
    })

    if (createResponse.ok === true) {
      const issueData = await createResponse.json()
      return issueData
    }

    const errorDetails = await createResponse.text()
    throw new Error(
      `Failed to create issue: Status code ${createResponse.status}\n` +
        `Response body: ${errorDetails}`,
    )
  }

  public async exec(todos: Array<string>) {
    const issueExists = await this.checkExistingIssue()

    if (issueExists !== undefined) {
      await this.update(issueExists.issueNumber, todos)
    } else {
      await this.create(todos)
    }
  }

  public getPermanentLinkMarkdown(
    filePath: string,
    commitHash: string,
    line: number,
  ): string {
    const url = `${this.#repositoryUrl}${commitHash}/${filePath}#L${line}`
    return `[${filePath}:${line}](${url})`
  }
}

export { GithubIssueClient }
