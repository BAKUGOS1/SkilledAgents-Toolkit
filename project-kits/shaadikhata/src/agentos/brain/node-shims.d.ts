declare module 'node:fs/promises' {
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<unknown>;
  export function readFile(path: string, encoding: 'utf8'): Promise<string>;
  export function writeFile(path: string, data: string, encoding: 'utf8'): Promise<unknown>;
  export function rm(path: string, options?: { force?: boolean; recursive?: boolean }): Promise<unknown>;
}
