import * as dom from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { cacheDir } from "../utils/cache_dir.ts";

const cacheOrCall = async (cachePath: URL, cb: () => Promise<string>): Promise<string> => {
  try {
    return await Deno.readTextFile(cachePath);
  } catch (ex) {
    if (ex instanceof Deno.errors.NotFound) {
      const res = await cb();
      await Deno.writeTextFile(cachePath, res)
      return res;
    }
    throw ex;
  }
}

const groupCodes: Record<string, string | undefined> = {
  'outline': 'sm',
  'solid': 'md',
}

// deno-lint-ignore require-await
export async function getAgent() {
  return {
    async getSvgIcon(url: URL) {
      const groupName = url.searchParams.get('group');
      const iconName = url.searchParams.get('icon_name');

      if (!groupName) throw new TypeError("URL require query params group");
      if (!iconName) throw new TypeError('URL require query params icon_name');

      const groupCode = groupCodes[groupName.toLowerCase()];

      if (!groupCode) throw new TypeError(`Unsupported group ${groupName}`);

      const pathCache = new URL(url.pathname.replace(/\W/g, '_'), cacheDir);
      const body = await cacheOrCall(pathCache, async () => (await fetch(url.toString())).text());

      const document = new dom.DOMParser().parseFromString(body, 'text/html');
      const buttonSelect = document?.querySelector(`[aria-label="${iconName}"][aria-controls="${iconName}-${groupCode}"]`);

      if (!buttonSelect) {
        throw new TypeError(`Not found svg icon`)
      }

      return {
        name: `${iconName}-${groupName}`,
        payload: buttonSelect.innerHTML,
      };
    }
  }
}