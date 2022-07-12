import { path } from "../deps.ts";

// deno-lint-ignore require-await
export async function getAgent() {
    return {
        async getSvgIcon(url: URL) {
            const payload = await Deno.readTextFile(url);
            return {
                name: path.basename(url.pathname, '.svg'),
                payload,
            }
        }
    }
}
