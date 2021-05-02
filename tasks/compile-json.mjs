import { parse } from 'yaml';
import fs  from 'fs';

const companyFiles = fs.readdirSync('./data/companies')
const companies = companyFiles
  .filter(companyFile => companyFile !== '_template.yml')
  .map(companyFile => {
    return fs.readFileSync(`./data/companies/${companyFile}`, { encoding: 'utf-8' })
  })
  .map(ymlData => {
    return parse(ymlData)
  })
  
const typeFiles = fs.readdirSync('./data/types')
const types = typeFiles
  .filter(companyFile => companyFile !== '_template.yml')
  .map(typeFile => {
    return fs.readFileSync(`./data/types/${typeFile}`, { encoding: 'utf-8' })
  })
  .map(ymlData => {
    return parse(ymlData)
  })

const data = {
  types,
  companies
}

fs.writeFileSync('data.json', JSON.stringify(data, undefined, 2))