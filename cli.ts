import { PullCollectionResource } from "./target/icon-package-manager.ts"
import { IPMFile } from "./utils/ipm-file.ts";
import { parseArgs } from "./utils/parseArgs.ts";
import { resolveConfigsPaths } from "./utils/resolveConfigsPaths.ts";


export async function bin(args: string[]) {
    const ipmFile = await IPMFile.eachIPMFileFactory(resolveConfigsPaths())
    const argsOptions = parseArgs(args);

    if (argsOptions.args[0] === "info") {
        console.log(ipmFile)
        return
    }

    if (argsOptions.args[0] === "pull") {
        await new PullCollectionResource(ipmFile).pullResources(ipmFile.icons, ipmFile.outDir, ipmFile.formatOut);
        return
    }
}

if (import.meta.main) {
    await bin([...Deno.args])
}
