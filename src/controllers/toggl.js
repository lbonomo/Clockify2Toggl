require('dotenv').config()

class Toggl {
  constructor () {
    this.axios = require('axios')
    this.api_host = process.env.toggl_api_host
    this.api_username = process.env.toggl_api_username
    this.api_password = process.env.toggl_api_password
    this.toggl_workspace_id = process.env.toggl_workspace_id
  }

  // Extraigo el ID a partir de un name.
  extractID (data, name, cid = null) {
    let id = ''
    data.forEach(element => {
      if (cid) {
        if (element.name === name && element.cid === cid) {
          id = element.id
        }
      } else {
        if (element.name === name) {
          id = element.id
        }
      }
    })
    return id
  }

  makeRequest () {
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: this.api_username,
        password: this.api_password
      }
    }
    return requestConfig
  }

  // Creo un cliente.
  async createClient (name) {
    // https://github.com/toggl/toggl_api_docs/blob/master/chapters/clients.md
    const url = `https://${this.api_host}/api/v8/clients`

    const data = {
      client: {
        name: name,
        wid: this.toggl_workspace_id,
        notes: 'Importado desde Clockify'
      }
    }

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: this.api_username,
        password: this.api_password
      }
    }
    const result = await this.axios
      .post(url, data, requestConfig)
      .then(response => {
        console.log(`Create a new client: ${name}`)
        return response.data
      })
      .catch(error => error)

    return result
  }

  // Obtengo el ID del cliente o lo creo.
  async getClientIDorCreate (name) {
  // Si no existe lo creo
    const url = `https://${this.api_host}/api/v8/clients`

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: this.api_username,
        password: this.api_password
      }
    }
    const result = await this.axios
      .get(url, requestConfig)
      .then(response => response)
      .catch(error => error)

    // Si Toggl respondio datos
    if (result.status === 200) {
      // Obtengo el ID
      let clienteID = this.extractID(result.data, name)
      if (!clienteID) {
        // Si el cliente no existe lo creo y devuelvo el ID
        clienteID = await this.createClient(name)
        return clienteID.data.id
      } else {
        // Si el cliente existe devulevo el ID
        return clienteID
      }
    } else {
      return 'Error'
    }
  }

  async createProject (name, clientID) {
    // https://github.com/toggl/toggl_api_docs/blob/master/chapters/projects.md
    const url = `https://${this.api_host}/api/v8/projects`

    const data = {
      project: {
        name: name,
        wid: this.toggl_workspace_id,
        is_private: true,
        cid: clientID
      }
    }

    const requestConfig = this.makeRequest()

    const result = await this.axios
      .post(url, data, requestConfig)
      .then(
        response => {
          console.log(`Create a new project: ${name}`)
          return response.data
        })
      .catch(error => console.log(error))

    return result
  }

  async getProjectIDorCreate (name, clientID) {
    // https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-projects
    const url = `https://${this.api_host}/api/v8/workspaces/${this.toggl_workspace_id}/projects`

    const requestConfig = this.makeRequest()

    const result = await this.axios
      .get(url, requestConfig)
      .then(response => response)
      .catch(error => error)

    // Si Toggl respondio datos
    if (result.status === 200) {
      // Obtengo el ID
      let projectID = this.extractID(result.data, name, clientID)
      if (!projectID) {
        // Si el cliente no existe lo creo y devuelvo el ID
        projectID = await this.createProject(name, clientID)
        return projectID.data.id
      } else {
        // Si el cliente existe devulevo el ID
        return projectID
      }
    } else {
      return 'Error'
    }
  }

  // Create a time entry
  async createTimeEntry (data) {
    const url = `https://${this.api_host}/api/v8/time_entries`
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: this.api_username,
        password: this.api_password
      }
    }

    const result = await this.axios
      .post(url, data, requestConfig)
      .then(response => response.data)
      .catch(error => error)

    return result
  }
}

module.exports = Toggl
