import fs from 'fs'
import sizeOf from 'image-size'

const dirname = `../assets`

const slugs = fs
  .readdirSync(dirname)
  .filter((filename) => !filename.startsWith(`.`)) // remove hidden system files

const upperFirst = (str) => str[0].toUpperCase() + str.slice(1)
const isProposition = (str) => [`and`, `to`, `vs`, `of`].includes(str)
const isAbbr = (str) =>
  [`qm`, `nn`, `phd`, `nf`, `made`, `maf`, `hea`, `vae`, `gan`].includes(str)
const setCase = (str) => {
  if (isProposition(str)) return str
  if (isAbbr(str)) return str.toUpperCase()
  return upperFirst(str)
}
const slugToTitle = (slug) => slug.split(`-`).map(setCase).join(` `)

// https://stackoverflow.com/a/8943487
const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi

const linkify = (text) =>
  text.replace(urlRegex, (url) => `<a href="` + url + `">` + url + `</a>`)

const parsedFiles = slugs.map((slug) => {
  const path = `${dirname}/${slug}/${slug}`

  const texFile = fs.readFileSync(`${path}.tex`, `utf-8`)
  const [desc, tikzCode] = texFile.split(`\\documentclass`)

  const { width, height } = sizeOf(`${path}.png`)

  return {
    title: slugToTitle(slug),
    slug,
    width,
    height,
    // split on LaTeX comment sign (%), join with HTML line breaks and
    // remove leading comment sign
    desc: linkify(desc.split(`\n% `).join(` `).slice(2)),
    code: `\\documentclass${tikzCode}`,
  }
})

fs.writeFileSync(
  `src/routes/slugs.js`,
  `export default ` + JSON.stringify(slugs)
)
fs.writeFileSync(
  `src/routes/texFiles.js`,
  `export default ` + JSON.stringify(parsedFiles)
)
