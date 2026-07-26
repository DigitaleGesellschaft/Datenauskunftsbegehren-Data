import { parse } from 'yaml';
import fs  from 'fs';

function readYml(dir, filter) {
  return fs.readdirSync(dir)
    .filter(filter)
    .map(file => fs.readFileSync(`${dir}/${file}`, { encoding: 'utf-8' }))
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
