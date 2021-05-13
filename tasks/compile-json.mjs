import { parse } from 'yaml';
import fs  from 'fs';

const orgFiles = fs.readdirSync('./data/orgs')
const orgs = orgFiles
  .filter(orgFile => orgFile !== '_template.yml')
  .map(orgFile => {
    return fs.readFileSync(`./data/orgs/${orgFile}`, { encoding: 'utf-8' })
  })
  .map(ymlData => {
    return parse(ymlData)
  })
  
const typeFiles = fs.readdirSync('./data/types')
const types = typeFiles
  .filter(typeFile => typeFile !== '_template.yml')
  .map(typeFile => {
    return fs.readFileSync(`./data/types/${typeFile}`, { encoding: 'utf-8' })
  })
  .map(ymlData => {
    return parse(ymlData)
  })

const eventFiles = fs.readdirSync('./data/events')
const events = eventFiles
  .filter(eventFile => eventFile !== '_template.yml')
  .map(eventFile => {
    return fs.readFileSync(`./data/events/${eventFile}`, { encoding: 'utf-8' })
  })
  .map(ymlData => {
    return parse(ymlData)
  })

const data = {
  types,
  orgs,
  events
}

fs.writeFileSync('data.json', JSON.stringify(data, undefined, 2))