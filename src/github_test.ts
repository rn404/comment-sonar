import { stub } from '@std/testing/mock'
import { assertEquals } from '@std/assert'
import { GithubIssueClient } from './github.ts'

Deno.test('GithubIssueClient: checkExistingIssue finds an issue', async () => {
  const fetchStub = stub(globalThis, 'fetch', () =>
    Promise.resolve({
      json: () =>
        Promise.resolve([{ title: ':pushpin: TODO/FIXME List', number: 123 }]),
    } as Response))

  try {
    const client = new GithubIssueClient(
      'test-token',
      'owner/repo',
      GithubIssueClient.DEFAULT_ISSUE_OPTIONS,
    )
    const result = await client['checkExistingIssue']()
    assertEquals(result, { issueNumber: 123 })
  } finally {
    fetchStub.restore()
  }
})

Deno.test('GithubIssueClient: update modifies an existing issue', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => Promise.resolve({ ok: true } as Response),
  )

  try {
    const client = new GithubIssueClient(
      'test-token',
      'owner/repo',
      GithubIssueClient.DEFAULT_ISSUE_OPTIONS,
    )
    await client['update'](123, ['TODO: Test case 1', 'FIXME: Test case 2'])

    assertEquals(fetchStub.calls.length, 1)
    assertEquals(
      fetchStub.calls[0].args[0],
      'https://api.github.com/repos/owner/repo/issues/123',
    )
    assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH')
  } finally {
    fetchStub.restore()
  }
})

Deno.test('GithubIssueClient: create creates a new issue', async () => {
  const fetchStub = stub(globalThis, 'fetch', () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ number: 456 }),
    } as Response))

  try {
    const client = new GithubIssueClient(
      'test-token',
      'owner/repo',
      GithubIssueClient.DEFAULT_ISSUE_OPTIONS,
    )
    const result = await client['create']([
      'TODO: Test case 1',
      'FIXME: Test case 2',
    ])

    assertEquals(result, { number: 456 })
    assertEquals(fetchStub.calls.length, 1)
    assertEquals(
      fetchStub.calls[0].args[0],
      'https://api.github.com/repos/owner/repo/issues',
    )
    assertEquals(fetchStub.calls[0].args[1]?.method, 'POST')
  } finally {
    fetchStub.restore()
  }
})

Deno.test('GithubIssueClient: exec updates an existing issue if found', async () => {
  const fetchStub = stub(globalThis, 'fetch', (url) => {
    if (url.toString().includes('state=open')) {
      return Promise.resolve({
        json: () =>
          Promise.resolve([{
            title: ':pushpin: TODO/FIXME List',
            number: 123,
          }]),
      } as Response)
    }
    return Promise.resolve({ ok: true } as Response)
  })

  try {
    const client = new GithubIssueClient(
      'test-token',
      'owner/repo',
      GithubIssueClient.DEFAULT_ISSUE_OPTIONS,
    )
    await client.exec(['TODO: Test case 1', 'FIXME: Test case 2'])

    assertEquals(fetchStub.calls.length, 2)
    assertEquals(
      fetchStub.calls[0].args[0],
      'https://api.github.com/repos/owner/repo/issues?state=open&labels=TODO',
    )
    assertEquals(
      fetchStub.calls[1].args[0],
      'https://api.github.com/repos/owner/repo/issues/123',
    )
  } finally {
    fetchStub.restore()
  }
})

Deno.test('GithubIssueClient: exec creates a new issue if none exists', async () => {
  const fetchStub = stub(globalThis, 'fetch', (url) => {
    if (url.toString().includes('state=open')) {
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response)
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ number: 456 }),
    } as Response)
  })

  try {
    const client = new GithubIssueClient(
      'test-token',
      'owner/repo',
      GithubIssueClient.DEFAULT_ISSUE_OPTIONS,
    )
    await client.exec(['TODO: Test case 1', 'FIXME: Test case 2'])

    assertEquals(fetchStub.calls.length, 2)
    assertEquals(
      fetchStub.calls[0].args[0],
      'https://api.github.com/repos/owner/repo/issues?state=open&labels=TODO',
    )
    assertEquals(
      fetchStub.calls[1].args[0],
      'https://api.github.com/repos/owner/repo/issues',
    )
  } finally {
    fetchStub.restore()
  }
})

Deno.test('GithubIssueClient: custom issueOptions are applied correctly', async () => {
  const fetchStub = stub(globalThis, 'fetch', (url, _options) => {
    if (url.toString().includes('state=open')) {
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response)
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ number: 789 }),
    } as Response)
  })

  try {
    const customOptions = {
      title: 'Custom Title',
      label: 'CustomLabel',
      body: {
        existingIssue: 'Custom existing issue body',
        noIssues: 'Custom no issues body',
      },
    }

    const client = new GithubIssueClient(
      'test-token',
      'owner/repo',
      customOptions,
    )
    await client.exec(['Custom TODO: Test case'])

    assertEquals(fetchStub.calls.length, 2)
    assertEquals(
      fetchStub.calls[1].args[1]?.body,
      JSON.stringify({
        title: 'Custom Title',
        body: 'Custom existing issue bodyCustom TODO: Test case',
        labels: ['CustomLabel'],
      }),
    )
  } finally {
    fetchStub.restore()
  }
})

Deno.test('GithubIssueClient: getPermanentLinkMarkdown returns correct markdown', () => {
  const client = new GithubIssueClient(
    'test-token',
    'owner/repo',
    GithubIssueClient.DEFAULT_ISSUE_OPTIONS,
  )

  const actual = client.getPermanentLinkMarkdown(
    'src/github.ts',
    'abc123',
    42,
  )

  assertEquals(
    actual,
    `[src/github.ts:42](https://github.com/owner/repo/blob/abc123/src/github.ts#L42)`,
  )
})
