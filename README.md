# :pencil2: comment-sonar

A GitHub Action that detects `TODO` and `FIXME` comments in your codebase and creates or updates a GitHub Issue to help you keep track of them.

Built with [Deno](https://deno.land/), designed to be lightweight, configurable, and CI-friendly.

## :rocket: Features

- Detects `TODO:` and `FIXME:` comments in your source files
- Creates or updates a single GitHub Issue to summarize findings
- Adds clickable links to exact file and line number
- Supports glob-based include/exclude path configuration
- Runs standalone as a GitHub Action — no setup required


## :wrench: Inputs

| Name               | Required | Description |
|--------------------|----------|-------------|
| `github_token`     | No       | GitHub token for authentication. Defaults to `${{ github.token }}` |
| `github_repository`| No       | Repository to operate on. Defaults to `${{ github.repository }}` |
| `sonar_includes`   | No       | Glob patterns to include. Default: `'**/*'` |
| `sonar_excludes`   | No       | Glob patterns to exclude. Default: `''` |
| `issue_title`      | No       | Title of the GitHub Issue. Default: `:pushpin: TODO/FIXME List` |
| `issue_label`      | No       | Label to apply to the GitHub Issue. Default: `TODO` |

## :test_tube: Example Usage

```yaml
name: Detect TODO Comments

on:
  push:
    branches: [main]

jobs:
  scan-todo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run comment-sonar
        uses: rn404/comment-sonar@v1
        with:
          sonar_includes: |
            src/**
            scripts/**
          sonar_excludes: |
            node_modules/
            dist/
```

## :bookmark: Output

The action generates or updates a GitHub Issue like this:

> :pushpin: TODO/FIXME List
> - `FIXME`: hardcoded path ([scripts/deploy.sh:5](https://github.com/your-org/your-repo/blob/abcd123/scripts/deploy.sh#L5))
> - `TODO`: clean up debug output ([src/utils/logger.ts:12](https://github.com/your-org/your-repo/blob/abcd123/src/utils/logger.ts#L12))



## :hammer: Requirements

- `GITHUB_TOKEN` is used to authenticate with the GitHub API

## :thread: Development

To run locally:

```sh
deno task precommit
deno task run
```

## 📘 License

MIT — see [LICENSE](https://github.com/rn404/comment-sonar/blob/main/LICENSE)
