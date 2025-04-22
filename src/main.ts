import { scanTodos } from "./scanner.ts";
import { createOrUpdateIssue } from "./github.ts";

async function main() {
  console.log("TODO/FIXMEコメントをスキャン中...");
  const todos = await scanTodos(".");

  console.log(`検出されたコメント数: ${todos.length}`);
  
  if (Deno.env.get("GITHUB_ACTIONS")) {
    await createOrUpdateIssue(todos);
  } else {
    console.log("ローカル実行のため、Issueは作成されません。");
    console.log(todos);
  }
}

main().catch(console.error);
