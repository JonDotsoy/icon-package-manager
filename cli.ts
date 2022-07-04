import { YAML } from "./deps.ts";
import { PullCollectionResource } from "./target/icon-package-manager.ts"
import { IPMFile } from "./utils/ipm-file.ts";
import { parseArgs } from "./utils/parseArgs.ts";
import { resolveConfigsPaths } from "./utils/resolveConfigsPaths.ts";


export async function bin(args: string[]) {
    const argsOptions = parseArgs(args);

    if (argsOptions.args[0] === "info") {
        const ipmFile = await IPMFile.eachIPMFileFactory(resolveConfigsPaths())
        console.log(ipmFile)
        return
    }

    if (argsOptions.args[0] === "pull") {
        const ipmFile = await IPMFile.eachIPMFileFactory(resolveConfigsPaths())
        await new PullCollectionResource(ipmFile).pullResources(ipmFile.icons, ipmFile.outDir, ipmFile.formatOut);
        return
    }

    if (argsOptions.args[0] === "init") {
        await Deno.writeTextFile(`${Deno.cwd()}/ipm.yaml`, await Deno.readTextFile(new URL("./samples/ipm.yaml", import.meta.url)))
        return;
    }
}

if (import.meta.main) {
    await bin([...Deno.args])
}
