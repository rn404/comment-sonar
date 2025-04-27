export async function createOrUpdateIssue(todos: Array<string>) {
  const token = Deno.env.get('GITHUB_TOKEN')
  const repo = Deno.env.get('GITHUB_REPOSITORY')

  if (!token || !repo) {
    throw new Error('GITHUB_TOKEN or GITHUB_REPOSITORY is not set.')
  }

  const [owner, repoName] = repo.split('/')
  const apiBase = `https://api.github.com/repos/${owner}/${repoName}/issues`
  const headers = {
    Authorization: `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }

  const issueTitle = '📌 TODO/FIXME List'
  const issueBody = todos.length > 0
    ? `The following TODO/FIXME comments were found:\n\n${todos.join('\n')}`
    : 'No TODO/FIXME comments were found.'

  const url = new URL(apiBase)
  url.searchParams.append('state', 'open')
  url.searchParams.append('labels', 'TODO')
  const response = await fetch(url.toString(), { headers })
  const issues = await response.json()

  // deno-lint-ignore no-explicit-any
  const existingIssue = issues.find((issue: any) => issue.title === issueTitle)

  if (existingIssue) {
    console.log('Updating the existing issue.')
    console.log(`${apiBase}/${existingIssue.number}`)
    await fetch(`${apiBase}/${existingIssue.number}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ body: issueBody }),
    })
  } else {
    console.log('Creating a new issue.')
    console.log(apiBase)
    try {
      const createResponse = await fetch(apiBase, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ['TODO'],
        }),
      })
      console.log(createResponse)
      if (createResponse.ok === true) {
        console.log('Issue created successfully.')
        const issueData = await createResponse.json()
        console.log(`Issue URL: ${issueData.html_url}`)
      }
    } catch (error) {
      console.error('An error occurred while creating the issue:', error)
    }
  }
}
