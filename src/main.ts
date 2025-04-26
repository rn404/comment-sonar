import { scanTodos } from "./scanner.ts";
import { createOrUpdateIssue } from "./github.ts";
import { Logger } from "./logger.ts";

async function main() {
  Logger.message("Scanning for TODO/FIXME comments...");
  const todos = await scanTodos(".");

  Logger.message(`Number of comments detected: ${todos.length}`);
  
  if (Deno.env.get("GITHUB_ACTIONS")) {
    await createOrUpdateIssue(todos);
  } else {
    Logger.message("Running locally, so no issues will be created.");
    Logger.message(todos);
  }
}

main().catch(console.error);
