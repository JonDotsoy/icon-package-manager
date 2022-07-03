

// deno-lint-ignore require-await
export const getAgent = async () => {
  return {
    // deno-lint-ignore require-await
    getSvgIcon: async (url: URL) => {
      const urlPattern = new URLPattern('*://*/:format/:codeImage/:name')
      const patternMatch = urlPattern.exec(url);
      if (!patternMatch) throw new Error(`No match ${url} prefer the next format *://*/:format/:codeImage/:name`)
      const svgDownload = new URL(`${patternMatch.protocol.input}://${patternMatch.hostname.input}/download/${patternMatch.pathname.groups.codeImage}/${patternMatch.pathname.groups.name}.svg`)

      const res = await fetch(svgDownload.toString())

      return {
        name: patternMatch.pathname.groups.name,
        payload: await res.text()
      }
    }
  }
}

