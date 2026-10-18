import { parse } from 'yaml';
import fs  from 'fs';

// Symbolic links are refused: their target could be any file of the machine,
// which would end up in the published JSON
function readYml(dir, filter) {
  if (fs.lstatSync(dir).isSymbolicLink()) {
    throw new Error(`${dir} is a symbolic link`)
  }
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => filter(entry.name))
    .map(entry => {
      if (!entry.isFile()) {
        throw new Error(`${dir}/${entry.name} is not a regular file`)
      }
      return fs.readFileSync(`${dir}/${entry.name}`, { encoding: 'utf-8' })
    })
    .map(ymlData => parse(ymlData))
}

function compileForLanguage(isTranslation) {
  const langFilter = isTranslation
    ? file => file.endsWith('.fr.yml')
    : file => !file.endsWith('.fr.yml') && file !== '_template.yml'

  const orgs = readYml('./data/orgs', langFilter).map(org => {
    delete org.sources
    return org
  })

  return {
    types: readYml('./data/types', langFilter),
    orgs,
    events: readYml('./data/events', langFilter),
    desires: readYml('./data/desires', langFilter),
  }
}

const dataDe = compileForLanguage(false)
const dataFr = compileForLanguage(true)

fs.writeFileSync('data_de.json', JSON.stringify(dataDe, undefined, 2))
fs.writeFileSync('data_fr.json', JSON.stringify(dataFr, undefined, 2))
fs.writeFileSync('data.json', JSON.stringify(dataDe, undefined, 2))
