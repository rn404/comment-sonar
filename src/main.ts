import { Sonar } from './sonar.ts'
import { GithubIssueClient } from './github.ts'
import { Logger } from './logger.ts'
import { relativePath } from './utils/relativePath.ts'

async function main() {
  Logger.message('Scanning for TODO/FIXME comments...')

  const paths = Deno.env.get('SONAR_PATHS') ?? '**/*'
  const sonar = new Sonar(Sonar.DEFAULT_COMMENT_TAGS)
  const { echos } = await sonar.scan([paths])

  const repoRoot = Deno.env.get('GITHUB_WORKSPACE') ?? Deno.cwd()
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
    const token = Deno.env.get('GITHUB_TOKEN')
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
    const issueTitle = Deno.env.get('GITHUB_ISSUE_TITLE')
    const issueLabel = Deno.env.get('GITHUB_ISSUE_LABEL')

    const githubClient = new GithubIssueClient(token, repo, {
      title: issueTitle,
      label: issueLabel,
    })
    await githubClient.exec(todos)
    return
  }

  // If not running in GitHub Actions, just log the todos
  Logger.message('Running locally, so no issues will be created.')
  Logger.message(todos)
}

main().catch(console.error)
