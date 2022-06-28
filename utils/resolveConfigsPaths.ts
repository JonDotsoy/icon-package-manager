import { path } from "../deps.ts";
import { getAllParentDir } from "./getAllParentDir.ts";


export function* resolveConfigsPaths() {
    const cwd = path.toFileUrl(`${Deno.cwd()}/`)

    yield new URL(`./ipm.yaml`, cwd)
    yield new URL(`./ipm.yml`, cwd)

    for (const p of getAllParentDir(cwd)) {
        yield new URL(`./ipm.yaml`, p)
        yield new URL(`./ipm.yml`, p)
    }
}