import { scanTodos } from "./scanner.ts";
import { createOrUpdateIssue } from "./github.ts";
import { Logger } from "./logger.ts";

async function main() {
  Logger.message("TODO/FIXMEコメントをスキャン中...");
  const todos = await scanTodos(".");

  Logger.message(`検出されたコメント数: ${todos.length}`);
  
  if (Deno.env.get("GITHUB_ACTIONS")) {
    await createOrUpdateIssue(todos);
  } else {
    Logger.message("ローカル実行のため、Issueは作成されません。");
    Logger.message(todos);
  }
}

main().catch(console.error);
