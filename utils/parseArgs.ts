
export interface ParseArgsOptions {
  stopParsingWith?: string | boolean
}

export interface ArgsOptions {
  command: string | null
  args: string[]
  extraArgs: string[]
  debug?: boolean
}

export function parseArgs(iterator: Iterable<string>, parseArgsOptions?: ParseArgsOptions): ArgsOptions {
  let extraArgsMode = false;
  const stopParsingWith = parseArgsOptions?.stopParsingWith === false ? null : parseArgsOptions?.stopParsingWith ?? '--';
  const options: ArgsOptions = {
    command: null,
    args: [],
    extraArgs: [],
  };

  for (const arg of iterator) {
    if (extraArgsMode) { options.extraArgs.push(arg); continue; }
    if (arg === stopParsingWith) { extraArgsMode = true; continue; }
    if (['-d', '--debug'].includes(arg)) { options.debug = true; continue; }
    if (!options.command) { options.command = arg; continue; }
    options.args.push(arg);
  }

  return options;
}
