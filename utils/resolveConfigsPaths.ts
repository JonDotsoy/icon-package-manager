import { path } from "../deps.ts";
import { getAllParentDir } from "./getAllParentDir.ts";



export function* resolveConfigsPaths(): Generator<{ ipmFile: URL, ipmFileLock: URL }> {
    const cwd = path.toFileUrl(`${Deno.cwd()}/`)

    yield { ipmFile: new URL(`./ipm.yaml`, cwd), ipmFileLock: new URL(`./ipm-lock.yaml`, cwd) }

    for (const baseCwd of getAllParentDir(cwd)) {
        yield { ipmFile: new URL(`./ipm.yaml`, baseCwd), ipmFileLock: new URL(`./ipm-lock.yaml`, baseCwd) }
    }
}
