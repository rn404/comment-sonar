class Logger {
  private static exec = (type: string, lines: string | Array<string>) => {
    if (type === 'debug' && Deno.env.get('DEBUG') !== 'true') {
      return;
    };

    let execFn;

    switch (type) {
      case 'error':
        execFn = console.error;
        break;
      case 'warn':
        execFn = console.warn;
        break;
      case 'info':
        execFn = console.info;
        break;
      case 'debug':
        execFn = console.log;
        break;
      default:
        execFn = console.log;
        break;
    };

    const messageLabel = type === 'message' ? 'Log' : type.toUpperCase()

    if (Array.isArray(lines) === true) {
      lines.forEach((line) => {
        execFn(`[${messageLabel}] ${line}`);
      });
      return;
    };

    execFn(`[${messageLabel}] ${lines}`);
  };

  static message(messages: string | Array<string>) {
    this.exec('message', messages);
  }

  static error(messages: string | Array<string>) {
    this.exec('error', messages);
  }

  static warn(messages: string | Array<string>) {
    this.exec('warn', messages);
  }

  static info(messages: string | Array<string>) {
    this.exec('info', messages);
  }

  static debug(messages: string | Array<string>) {
    this.exec('debug', messages);
  }
}

export { Logger };
