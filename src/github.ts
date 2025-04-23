export async function createOrUpdateIssue(todos: string[]) {
  const token = Deno.env.get("GITHUB_TOKEN");
  const repo = Deno.env.get("GITHUB_REPOSITORY");

  if (!token || !repo) {
    console.error("GITHUB_TOKENまたはGITHUB_REPOSITORYが設定されていません。");
    return;
  }

  const [owner, repoName] = repo.split("/");
  const apiBase = `https://api.github.com/repos/${owner}/${repoName}/issues`;
  const headers = {
    Authorization: `token ${token}`,
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  const issueTitle = "📌 TODO/FIXME リスト";
  const issueBody = todos.length > 0
    ? `以下のTODO/FIXMEが見つかりました:\n\n${todos.join("\n")}`
    : "TODO/FIXMEコメントは見つかりませんでした。";

  // 既存Issueを検索
  const response = await fetch(`${apiBase}?state=open&labels=TODO`, { headers });
  const issues = await response.json();

  const existingIssue = issues.find((issue: any) => issue.title === issueTitle);

  if (existingIssue) {
    console.log("既存のIssueを更新します。");
    console.log(`${apiBase}/${existingIssue.number}`);
    await fetch(`${apiBase}/${existingIssue.number}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ body: issueBody }),
    });
  } else {
    console.log("新規Issueを作成します。");
    console.log(apiBase);
    try {
      await fetch(apiBase, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ["TODO"],
        }),
      });
    } catch (error) {
      console.error("Issueの作成中にエラーが発生しました:", error);
    };
  }
}
