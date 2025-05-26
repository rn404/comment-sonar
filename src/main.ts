import { Sonar } from './sonar.ts'
import { GithubIssueClient } from './github.ts'
import { Logger } from './logger.ts'
import { relativePath } from './utils/relativePath.ts'
import { readMultiParam } from './utils/readMultiParam.ts'

async function main() {
  Logger.message('Scanning for TODO/FIXME comments...')

  const paths = readMultiParam(Deno.env.get('INPUT_SONAR_INCLUDES') ?? '**/*')
  const ignorePaths = readMultiParam(Deno.env.get('INPUT_SONAR_EXCLUDES') ?? '')
  const repoRoot = Deno.env.get('GITHUB_WORKSPACE') ?? Deno.cwd()
  const sonar = new Sonar(
    Sonar.DEFAULT_COMMENT_TAGS,
    repoRoot,
    [...Sonar.DEFAULT_IGNORE_PATHS, ...ignorePaths],
  )
  const { echos } = await sonar.scan(paths)

  const todos = echos.map((echo) => {
    return [
      `- `,
      `${echo.commentTag}: `,
      `${echo.comment}`,
      ` (${relativePath(echo.fileName, repoRoot)}`,
      `:L${echo.line})`,
    ].join('')
  })

  Logger.message(`Number of comments detected: ${echos.length}`)

  if (Deno.env.get('GITHUB_ACTIONS')) {
    const token = Deno.env.get('INPUT_GITHUB_TOKEN') ||
      Deno.env.get('GITHUB_TOKEN')
    const repo = Deno.env.get('GITHUB_REPOSITORY')

    if (token === undefined || token === '') {
      Logger.error(
        'GITHUB_TOKEN is not set. Please set it in your GitHub Actions environment.',
      )
      Deno.exit(1)
    }
    if (repo === undefined || repo === '') {
      Logger.error(
        'GITHUB_REPOSITORY is not set. Please set it in your GitHub Actions environment.',
      )
      Deno.exit(1)
    }

    // Optional environment variables for GitHub Actions
    const issueTitle = Deno.env.get('INPUT_ISSUE_TITLE') ??
      GithubIssueClient.DEFAULT_ISSUE_OPTIONS.title
    const issueLabel = Deno.env.get('INPUT_ISSUE_LABEL') ??
      GithubIssueClient.DEFAULT_ISSUE_OPTIONS.label
    const commitHash = Deno.env.get('GITHUB_SHA') ?? 'HEAD'
    Logger.message(`Permanent links will reference commit: ${commitHash}`)

    const githubClient = new GithubIssueClient(token, repo, {
      title: issueTitle,
      label: issueLabel,
      body: GithubIssueClient.DEFAULT_ISSUE_OPTIONS.body,
    })
    const todos = echos.map((echo) => {
      return [
        `- `,
        `\`${echo.commentTag}\`: `,
        `${echo.comment}`,
        `(${
          githubClient.getPermanentLinkMarkdown(
            relativePath(echo.fileName, repoRoot),
            commitHash,
            echo.line,
          )
        })`,
      ].join('')
    })
    Logger.message(
      echos.map((echo) => {
        return `${echo.commentTag}: ${echo.comment} (${
          relativePath(echo.fileName, repoRoot)
        }:L${echo.line})`
      }),
    )
    await githubClient.exec(todos)
    return
  }

  // If not running in GitHub Actions, just log the todos
  Logger.message('Running locally, so no issues will be created.')
  Logger.message(todos)
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    Logger.error(error.message)
  } else {
    Logger.error(`Unhandled error in main:`)
    console.error(error)
  }
  Deno.exit(1)
})
