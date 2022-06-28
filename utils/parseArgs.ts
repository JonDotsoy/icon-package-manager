
export interface ArgsOptions {
  args: string[]
  help?: boolean
}

export function parseArgs(iterator: Iterable<string>): ArgsOptions {
  const options: ArgsOptions = {
    args: []
  };

  for(const arg of iterator) {
    if(["-h", '--help'].includes(arg) || (!options.args.length && ["h", "help"].includes(arg))) { options['help'] = true; continue; }
    options.args.push(arg);
  }

  return options;
}
