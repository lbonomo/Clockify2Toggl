const { getDateRange } = require('../libs/datetime')
require('dotenv').config()

class Clockify {
  // https://clockify.me/developers-api
  constructor () {
    this.axios = require('axios')
    this.apiHost = process.env.clockify_api_host
    this.apiReportsHost = process.env.clockify_api_reports_host
    this.apiKey = process.env.clockify_api_key
    this.workspaceId = process.env.clockify_workspaceId
  }

  async getTasks (range) {
    const url = `https://${this.apiReportsHost}/v1/workspaces/${this.workspaceId}/reports/detailed`

    const data = {
      dateRangeStart: getDateRange(range).start,
      dateRangeEnd: getDateRange(range).end,
      detailedFilter: {
        page: 1,
        pageSize: 200 // Maximo 200
      },
      sortColumn: 'DATE',
      sortOrder: 'ASCENDING',
      amountShown: 'HIDE_AMOUNT'
    }

    const headers = {
      'X-Api-Key': this.apiKey,
      content_type: 'json',
      accept: 'application/json'
    }

    const result = await this.axios
      .post(url, data, { headers: headers })
      .then(response => response)
      .catch(error => console.log(error))

    return result
  }
}

module.exports = Clockify
