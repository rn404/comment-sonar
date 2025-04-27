import { scanTodos } from './scanner.ts'
import { GithubIssueClient } from './github.ts'
import { Logger } from './logger.ts'

async function main() {
  Logger.message('Scanning for TODO/FIXME comments...')
  const todos = await scanTodos('.')

  Logger.message(`Number of comments detected: ${todos.length}`)

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
    const githubClient = new GithubIssueClient(token, repo)
    await githubClient.exec(todos)
  } else {
    Logger.message('Running locally, so no issues will be created.')
    Logger.message(todos)
  }
}

main().catch(console.error)
