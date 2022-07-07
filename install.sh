IPM_VERSION=$1

if [[ -z "$IPM_VERSION" ]]
then
    echo ⚙️ Buscando latest version
    IPM_VERSION="$(deno eval --reload "console.log((await import('https://deno.land/x/ipm/version.ts')).version)")"
fi

OUTPUT_BIN=$HOME/.ipm/versions/$IPM_VERSION

if [[ -f $OUTPUT_BIN ]]
then
    echo ✅ Already IPM v${IPM_VERSION} installed
else
    deno compile --output=$OUTPUT_BIN https://deno.land/x/ipm@v$IPM_VERSION/cli.ts
fi
