import { walk } from '@std/fs'

async function scanTodos(basePath: string): Promise<Array<string>> {
  console.log(`Scanning for TODO/FIXME comments in ${basePath}`)
  const todos: string[] = []

  for await (const entry of walk(basePath, { exts: ['.ts', '.js'] })) {
    const content = await Deno.readTextFile(entry.path)
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      const match = line.match(/\/\/\s*(TODO|FIXME):?\s*(.+)/i)
      if (match) {
        todos.push(`${entry.path}:${index + 1} - ${match[2].trim()}`)
      }
    })
  }

  return todos
}

export { scanTodos }
