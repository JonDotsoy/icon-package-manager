import { PullCollectionResource } from "./target/icon-package-manager.ts"
import { IPMFile } from "./utils/ipm-file.ts";
import { parseArgs } from "./utils/parseArgs.ts";
import { resolveConfigsPaths } from "./utils/resolveConfigsPaths.ts";


const helpMessage = `
ipm <command>

Usage:

ipm init           Create a initial ipm.yaml file
ipm pull           Download all assets and generate the icons files

imp ${import.meta.url}`

const seeListCommands = `
To see a list of supported ipm commands, run:
  ipm help`

class CliError extends Error { }

class UnknownCommand extends CliError {
    constructor(readonly command: string) { super(`Unknown command: ${Deno.inspect(command)}`) }
}

export async function bin(args: string[]) {
    const { args: [command], help } = parseArgs(args);

    if (command === "info") {
        const ipmFile = await IPMFile.eachIPMFileFactory(resolveConfigsPaths())
        console.log(ipmFile)
        return
    }

    if (command === "pull") {
        const ipmFile = await IPMFile.eachIPMFileFactory(resolveConfigsPaths())
        await new PullCollectionResource(ipmFile).pullResources(ipmFile.icons, ipmFile.outDir, ipmFile.formatOut);
        return
    }

    if (command === "init") {
        await Deno.writeTextFile(`${Deno.cwd()}/ipm.yaml`, await Deno.readTextFile(new URL("./samples/ipm.yaml", import.meta.url)))
        return;
    }

    if (help) {
        return console.log(helpMessage)
    }

    throw new UnknownCommand(command);
}

if (import.meta.main) {
    try {
        await bin([...Deno.args])
    } catch (ex) {
        if (ex instanceof UnknownCommand) {
            console.log(`${ex.message}`)
            console.log(seeListCommands)
        } else {
            throw ex;
        }
    }
}
