/**
 * Main process. Get time entry from Clockify and import in Toggl.
 * https://clockify.me/
 * https://toggl.com/track/
 *
 */

const fs = require('fs')
const { Command } = require('commander')
const Toggl = require('./controllers/toggl')
const Clockify = require('./controllers/clockify')

const args = new Command()
args
  .option('-c, --config <config-file>', 'Path to the config file', 'config.json')

const loop = async (entries, oldEntries) => {
  const toggl = new Toggl()

  for (const entrie of entries) {
    const clockifyID = entrie._id
    // Si el ID ya esta registrado no lo inserto.
    if (!oldEntries.includes(clockifyID)) {
      // Obtengo el ID del cliente para luego buscar el ID del proyecto.
      const clientID = await toggl.getClientIDorCreate(entrie.clientName)

      // Objento el ID del Projecto.
      const projectID = await toggl.getProjectIDorCreate(entrie.projectName, clientID)

      const data = {
        time_entry: {
          description: entrie.description,
          tags: ['facturable'],
          start: entrie.timeInterval.start,
          duration: entrie.timeInterval.duration,
          pid: projectID,
          created_with: 'Clockify2Toggl'
        }
      }

      const togglEntry = await toggl.createTimeEntry(data)
      const togglID = togglEntry.data.id
      const time = new Date()
      // Registro timestamp:clockifyID:togglID
      fs.appendFileSync('timeentries.txt', `${time.getTime()}:${clockifyID}:${togglID}\n`)
      console.log(`Nuevo registro: ${entrie.description}`)
    } else {
      console.log(`Registro duplicado: ${entrie.description}`)
    }
  }
}

const main = async () => {
  const clockify = new Clockify()

  const result = await clockify.getTasks('LastMonth')

  if (result.status === 200) {
    const entries = result.data.timeentries
    const timeFile = 'timeentries.txt'
    try {
      if (fs.existsSync(timeFile)) {
        const lines = fs.readFileSync(timeFile, 'utf-8').split('\n')
        const oldEntries = lines.map(line => line.split(':')[1])
        loop(entries, oldEntries)
      } else {
        const oldEntries = []
        loop(entries, oldEntries)
      }
    } catch (err) {
      console.error(err)
    }
  }
}

main()
