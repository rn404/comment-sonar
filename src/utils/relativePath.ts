import { relative } from '@std/path'

const relativePath = (path: string, base: string): string => {
  return relative(base, path)
}

export { relativePath }
