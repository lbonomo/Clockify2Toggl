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

/**
 * Read arguments
 */
const program = new Command() 
program.requiredOption('-c, --config <config-file>', 'Path to the config file')
program.parse(process.argv)
const options = program.opts();

/**
 * This fuction read device config file.
 * @param {string} file Config file.
 * @return {object} Json with status and data (all products or error message).
 */
const LoadConfig = (file) => {
  var rawdata = ''
  if (fs.existsSync(file)) {
    rawdata = fs.readFileSync(file)
    return {
      status: 'successful',
      data: JSON.parse(rawdata)
    }
  } else {
    return {
      status: 'failure',
      data: { message: 'Can not read the config file' }
    }
  }
}

/**
 * Main loop
 * @param {array} entries Config file.
 * @param {arrayg} oldEntries Config file.
 * @return {object} Json with status and data (all products or error message).
 */
const loop = async (config, entries, oldEntries) => {
  const toggl = new Toggl(config.toggl)

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
          tags: config.toggl.tags,
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
  // Load config file 
  const cfg = await LoadConfig(options.config)

  if (cfg.status === 'successful') {

    const config = cfg.data

    const clockify = new Clockify(config.clockfy)

    const result = await clockify.getTasks(config.period)

    if (result.status === 200) {
      const entries = result.data.timeentries
      const timeFile = 'timeentries.txt'
      try {
        if (fs.existsSync(timeFile)) {
          const lines = fs.readFileSync(timeFile, 'utf-8').split('\n')
          const oldEntries = lines.map(line => line.split(':')[1])
          loop(config, entries, oldEntries)
        } else {
          const oldEntries = []
          loop(config, entries, oldEntries)
        }
      } catch (err) {
        console.error(err)
      }
    }
  } else {
    console.log("Can't read config file")
  }
}

main()
