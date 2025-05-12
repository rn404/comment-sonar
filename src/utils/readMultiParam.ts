const readMultiParam = (inputs: string): Array<string> => {
  return inputs
    .split(/\r?\n|,/)
    .map((param) => param.trim())
    .filter(Boolean)
}

export { readMultiParam }
