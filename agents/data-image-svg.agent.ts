let iconCount = 0;

// deno-lint-ignore require-await
export async function getAgent() {
    return {
        // deno-lint-ignore require-await
        async getSvgIcon(url: URL) {
            iconCount += 1;
            const [_contentType, payload] = url.pathname.split(',');
            return {
                name: `data-icon-${iconCount}`,
                payload: decodeURI(payload),
            }
        }
    }
}
