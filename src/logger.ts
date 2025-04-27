class Logger {
  private static exec = (type: string, lines: string | Array<string>) => {
    if (type === 'debug' && Deno.env.get('DEBUG') !== 'true') {
      return
    }

    let _execFn

    switch (type) {
      case 'error':
        _execFn = console.error
        break
      case 'warn':
        _execFn = console.warn
        break
      case 'info':
        _execFn = console.info
        break
      case 'debug':
        _execFn = console.log
        break
      default:
        _execFn = console.log
        break
    }

    const messageLabel = type === 'message' ? 'LOG' : type.toUpperCase()
    const execFn = (line: string) => {
      _execFn(`[${messageLabel}] ${line}`)
    }

    if (Array.isArray(lines) === true) {
      lines.forEach((line) => {
        execFn(line)
      })
      return
    }

    execFn(lines)
  }

  static message(messages: string | Array<string>) {
    this.exec('message', messages)
  }

  static error(messages: string | Array<string>) {
    this.exec('error', messages)
  }

  static warn(messages: string | Array<string>) {
    this.exec('warn', messages)
  }

  static info(messages: string | Array<string>) {
    this.exec('info', messages)
  }

  static debug(messages: string | Array<string>) {
    this.exec('debug', messages)
  }
}

export { Logger }
