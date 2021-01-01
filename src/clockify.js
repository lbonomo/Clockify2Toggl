require('dotenv').config()
const axios = require('axios');
const dateFormat = require("dateformat");

const api_host = process.env.api_host
const api_reports_host = process.env.api_reports_host
const api_key = process.env.api_key
const workspaceId = process.env.workspaceId

// https://clockify.me/developers-api

// List user data
// console.log(`curl -H "content-type: application/json" -H "X-Api-Key: ${api_key}" -X GET ${api_host}/user | jq --color-output`)

// List Workspaces ID
// console.log(`curl -H "content-type: application/json" -H "X-Api-Key: ${api_key}" -X GET ${api_host}/api/v1/workspaces | jq --color-output '.[] | "\\(.name): \\(.id)"'`)


let filter = {
   "dateRangeStart": "2020-12-01T00:00:00.000",
   "dateRangeEnd": "2020-12-31T23:59:59.000",
   "summaryFilter": {
      "groups": [
         "USER",
         "PROJECT",
         "TIMEENTRY"
      ]
   },
   "amountShown": "HIDE_AMOUNT"
}

// Necesario para workspace de terceros "amountShown": "HIDE_AMOUNT" 
// console.log(`curl -H "content-type: application/json" -H "X-Api-Key: ${api_key}" -X POST -d '${JSON.stringify(filter)}' ${api_reports_host}/v1/workspaces/${workspaceId}/reports/summary | jq --color-output`)




// console.log(`curl -H "content-type: application/json" -H "X-Api-Key: ${api_key}" -X POST -d '${JSON.stringify(filter)}' ${api_reports_host}/v1/workspaces/${workspaceId}/reports/detailed | jq --color-output`)

const toHHMMSS = (time) => {

   var sec_num = parseInt(time, 10); // don't forget the second param
   var hours   = Math.floor(sec_num / 3600);
   var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
   var seconds = sec_num - (hours * 3600) - (minutes * 60);

   if (hours   < 10) {hours   = "0"+hours;}
   if (minutes < 10) {minutes = "0"+minutes;}
   if (seconds < 10) {seconds = "0"+seconds;}
   return hours+':'+minutes+':'+seconds;
}


const toDDMMYYYY = (date) => {
   // Return date in format dd/mm/yyyy
   
   const day = date.getDate()
   const month = date.getMonth() + 1
   const year = date.getFullYear()
   return `${day}/${month}/${year}`;
}

// Return de start and end of last month
const get_date_range = (target) => {
   
   const now = new Date()
   const startThisMonth = new Date(`${now.getFullYear()}-${now.getMonth()+1}-01 23:59:59 GMT`)
   // const endLastMonth = new Date( startThisMonth.getFullYear(), startThisMonth.getMonth()+1, startThisMonth.getDate()-1)
   const endLastMonth = startThisMonth
   endLastMonth.setDate( endLastMonth.getDate() -1 )
   const startLastMonth = new Date(`${endLastMonth.getFullYear()}-${endLastMonth.getMonth()+1}-01 GMT`)
   
   switch (target) {
      case "LastMonth":
         return {
            "start": startLastMonth,
            "end": endLastMonth,
         }
         break

      default:
         console.log("Rango no encontrado")
         process.exit(1)
   }

}

const renderData = (data) => {
   
   dateFormat.masks.shortDate = 'dd/mm/yyyy'
      
   const config = JSON.parse(data.config.data)
   const totals = data.data.totals[0]
   // const dateRangeStart = new Date(config.dateRangeStart)
   const dateRangeStart = dateFormat(new Date(config.dateRangeStart), 'shortDate')
   const dateRangeEnd = dateFormat(new Date(config.dateRangeEnd), 'shortDate')
   const entries = data.data.timeentries

   // Sumary
   console.log('## Summary')
   // console.log(`Date range start: ${toDDMMYYYY(dateRangeStart)}`)
   console.log(`Date range start: ${dateRangeStart}`)
   console.log(`Date range end:   ${dateRangeEnd}`)
   console.log(`Total time:       ${toHHMMSS(totals.totalTime)}`)
   console.log(`Total entries:    ${totals.entriesCount}`)
   console.log('\n## Entries')

   entries.forEach(entry => {
      const start = dateFormat(new Date(entry.timeInterval.start), 'shortDate')
      const end = dateFormat(new Date(entry.timeInterval.end), 'shortDate')
      const duration = toHHMMSS(entry.timeInterval.duration)
      console.log(`${start} - ${ entry.description } (${duration})`  )
      
   });


   // console.log(data.data.timeentries)
}

const GetTask = async () => {

   const data = {
      "dateRangeStart": get_date_range('LastMonth').start,
      "dateRangeEnd": get_date_range('LastMonth').end,
      "detailedFilter": {
         "page": 1,
         "pageSize": 200, // Maximo 200
         },
      "sortColumn": "DATE",
      "sortOrder": "ASCENDING",
      "amountShown": "HIDE_AMOUNT"
   }


   const headers = {
      'X-Api-Key': api_key,
      content_type: "json", 
      accept: "application/json"
   }
   
   const url = `https://${api_reports_host}/v1/workspaces/${workspaceId}/reports/detailed`
      
   axios.post( url, data, { headers: headers} )
    .then(response => { renderData(response)  })
    .catch(error => console.log(error) )
}



const main = async() => {
   await GetTask()
}

main()