import { spy, assertSpyCalls, assertSpyCall } from "@std/testing/mock";
import { Logger } from './logger.ts';

Deno.test('Logger: message', () => {
  const logSpy = spy(console, 'log');
  Logger.message('Test message');
  assertSpyCalls(logSpy, 1);
  assertSpyCall(logSpy, 0, { args: ['[LOG] Test message'] });
  logSpy.restore();
});

Deno.test('Logger: error', () => {
  const errorSpy = spy(console, 'error');
  Logger.error('Test error');
  assertSpyCalls(errorSpy, 1);
  assertSpyCall(errorSpy, 0, { args: ['[ERROR] Test error'] });
  errorSpy.restore();
});

Deno.test('Logger: warn', () => {
  const warnSpy = spy(console, 'warn');
  Logger.warn('Test warning');
  assertSpyCalls(warnSpy, 1);
  assertSpyCall(warnSpy, 0, { args: ['[WARN] Test warning'] });
  warnSpy.restore();
});

Deno.test('Logger: info', () => {
  const infoSpy = spy(console, 'info');
  Logger.info('Test info');
  assertSpyCalls(infoSpy, 1);
  assertSpyCall(infoSpy, 0, { args: ['[INFO] Test info'] });
  infoSpy.restore();
});

Deno.test('Logger: debug (DEBUG=true)', () => {
  const debugSpy = spy(console, 'log');
  Deno.env.set('DEBUG', 'true');
  Logger.debug('Test debug');
  assertSpyCalls(debugSpy, 1);
  assertSpyCall(debugSpy, 0, { args: ['[DEBUG] Test debug'] });
  debugSpy.restore();
  Deno.env.delete('DEBUG');
});

Deno.test('Logger: debug (DEBUG=false)', () => {
  const debugSpy = spy(console, 'log');
  Deno.env.set('DEBUG', 'false');
  Logger.debug('Test debug');
  assertSpyCalls(debugSpy, 0);
  debugSpy.restore();
  Deno.env.delete('DEBUG');
});

Deno.test('Logger: handle array of messages', () => {
  const logSpy = spy(console, 'log');
  Logger.message(['Message 1', 'Message 2']);
  assertSpyCalls(logSpy, 2);
  assertSpyCall(logSpy, 0, { args: ['[LOG] Message 1'] });
  assertSpyCall(logSpy, 1, { args: ['[LOG] Message 2'] });
  logSpy.restore();
});