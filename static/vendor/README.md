# Third-party browser libraries

These files are copied into the repository so the site needs no Node.js/npm
to run or build. You should not need to edit anything here.

| Library | Version | License |
|---|---|---|
| GSAP + ScrollTrigger (`gsap/gsap.min.js`) | 3.15.0 | GSAP Standard "no charge" license: https://gsap.com/standard-license |
| Lenis (`lenis/lenis.min.js`) | 1.3.26 | MIT (`lenis/LICENSE`) |

## How these were produced (for maintainers)

Each file is a minified ES module made with esbuild from the npm packages:

```sh
npm i gsap@3.15.0 lenis@1.3.26 esbuild
printf "export { gsap, gsap as default } from 'gsap';\nexport { ScrollTrigger } from 'gsap/ScrollTrigger';\n" > gsap-entry.js
npx esbuild gsap-entry.js  --bundle --minify --format=esm --outfile=gsap/gsap.min.js
npx esbuild node_modules/lenis/dist/lenis.mjs --minify --format=esm --outfile=lenis/lenis.min.js
```

Three.js was used for an early 3D prototype and removed in October 2026.
