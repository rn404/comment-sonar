import { stub } from '@std/testing/mock'
import { assertEquals } from '@std/assert'
import { GithubIssueClient } from './github.ts'

Deno.test('GithubIssueClient: checkExistingIssue finds an issue', async () => {
  const fetchStub = stub(globalThis, 'fetch', () =>
    Promise.resolve({
      json: () => Promise.resolve([{ title: ':pushpin: TODO/FIXME List', number: 123 }]),
    } as Response),
  )

  try {
    const client = new GithubIssueClient('test-token', 'owner/repo')
    const result = await client['checkExistingIssue']()
    assertEquals(result, { issueNumber: 123 })
  } finally {
    fetchStub.restore()
  }
})

Deno.test('GithubIssueClient: update modifies an existing issue', async () => {
  const fetchStub = stub(globalThis, 'fetch', () =>
    Promise.resolve({ ok: true } as Response),
  )

  try {
    const client = new GithubIssueClient('test-token', 'owner/repo')
    await client['update'](123, ['TODO: Test case 1', 'FIXME: Test case 2'])

    assertEquals(fetchStub.calls.length, 1)
    assertEquals(fetchStub.calls[0].args[0], 'https://api.github.com/repos/owner/repo/issues/123')
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
    } as Response),
  )

  try {
    const client = new GithubIssueClient('test-token', 'owner/repo')
    const result = await client['create'](['TODO: Test case 1', 'FIXME: Test case 2'])

    assertEquals(result, { number: 456 })
    assertEquals(fetchStub.calls.length, 1)
    assertEquals(fetchStub.calls[0].args[0], 'https://api.github.com/repos/owner/repo/issues')
    assertEquals(fetchStub.calls[0].args[1]?.method, 'POST')
  } finally {
    fetchStub.restore()
  }
})

Deno.test('GithubIssueClient: exec updates an existing issue if found', async () => {
  const fetchStub = stub(globalThis, 'fetch', (url) => {
    if (url.toString().includes('state=open')) {
      return Promise.resolve({
        json: () => Promise.resolve([{ title: ':pushpin: TODO/FIXME List', number: 123 }]),
      } as Response)
    }
    return Promise.resolve({ ok: true } as Response)
  })

  try {
    const client = new GithubIssueClient('test-token', 'owner/repo')
    await client.exec(['TODO: Test case 1', 'FIXME: Test case 2'])

    assertEquals(fetchStub.calls.length, 2)
    assertEquals(fetchStub.calls[0].args[0], 'https://api.github.com/repos/owner/repo/issues?state=open&labels=TODO')
    assertEquals(fetchStub.calls[1].args[0], 'https://api.github.com/repos/owner/repo/issues/123')
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
    const client = new GithubIssueClient('test-token', 'owner/repo')
    await client.exec(['TODO: Test case 1', 'FIXME: Test case 2'])

    assertEquals(fetchStub.calls.length, 2)
    assertEquals(fetchStub.calls[0].args[0], 'https://api.github.com/repos/owner/repo/issues?state=open&labels=TODO')
    assertEquals(fetchStub.calls[1].args[0], 'https://api.github.com/repos/owner/repo/issues')
  } finally {
    fetchStub.restore()
  }
})
