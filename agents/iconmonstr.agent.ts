import { dom } from "../deps.ts";

// deno-lint-ignore require-await
export async function parseBodyEntry(payload: string) {
    const html = new dom.DOMParser().parseFromString(payload, 'text/html')

    if (!html) {
        throw new Error(`Un supported HTML`)
    }

    // const t = $(".active-id").attr("id").substr(0, 32)
    // const n = $(".container-header-menu").attr("id")
    // const i = "/" + $(".active.toggle-btn").attr("id") + "/iconmonstr-"
    // const r = $(".download-btn").attr("id")
    // const o = "." + $(".container-content-preview").attr("id");
    // const href = "/?s2member_file_download_key=" + t + "&s2member_file_download=" + n + i + r + o;

    const activeId = html.querySelector('.active-id')?.id.substring(0, 32)
    const headerMenuId = html.querySelector('.container-header-menu')?.id
    const activeFormat = html.querySelector('.active.toggle-btn')?.id
    const bottomId = html.querySelector('.download-btn')?.id
    const previewId = html.querySelector('.container-content-preview')?.id

    if (!activeId) throw new Error('Cannot found activeId')
    if (!headerMenuId) throw new Error('Cannot found headerMenuId')
    if (!activeFormat) throw new Error('Cannot found activeFormat')
    if (!bottomId) throw new Error('Cannot found bottomId')
    if (!previewId) throw new Error('Cannot found previewId')

    const url = new URL('https://iconmonstr.com/')

    url.searchParams.append('s2member_file_download_key', activeId)
    url.searchParams.append('s2member_file_download', `${headerMenuId}/${activeFormat}/iconmonstr-${bottomId}.${previewId}`)


    return {
        activeId,
        headerMenuId,
        activeFormat,
        bottomId,
        previewId,
        url,
        toString() { return url.toString() }
    };
}


export class IconmonstrAgent {
    async getSvgIcon(url: URL) {
        const payload = await (await fetch(url.toString())).text();
        const svgUrl = (await parseBodyEntry(payload)).toString();
        const svgPayload = await (await fetch(svgUrl)).text();
        return {
            name: url.pathname,
            payload: svgPayload,
        }
    }
}

export const getAgent = () => new IconmonstrAgent()