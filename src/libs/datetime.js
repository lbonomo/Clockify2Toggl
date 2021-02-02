const toHHMMSS = (integer) => {
  // don't forget the second param
  const secNum = parseInt(integer, 10)
  let hours = Math.floor(secNum / 3600)
  let minutes = Math.floor((secNum - (hours * 3600)) / 60)
  let seconds = secNum - (hours * 3600) - (minutes * 60)

  if (hours < 10) { hours = '0' + hours }
  if (minutes < 10) { minutes = '0' + minutes }
  if (seconds < 10) { seconds = '0' + seconds }
  return `${hours}:${minutes}:${seconds}`
}

// Return de start and end of last month
const getDateRange = (target) => {
  const now = new Date()
  const startThisMonth = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-01 23:59:59 GMT`)
  // const endLastMonth = new Date( startThisMonth.getFullYear(), startThisMonth.getMonth()+1, startThisMonth.getDate()-1)
  const endLastMonth = startThisMonth
  endLastMonth.setDate(endLastMonth.getDate() - 1)
  const startLastMonth = new Date(`${endLastMonth.getFullYear()}-${endLastMonth.getMonth() + 1}-01 GMT`)

  const endThisMonth = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} 23:59:59 GMT`)
  const startToday = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} 00:00:00 GMT`)
  const endToday = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} 23:59:59 GMT`)

  switch (target) {
    case 'LastMonth':
      return {
        start: startLastMonth,
        end: endLastMonth
      }

    case 'ThisMonth':
      return {
        start: startThisMonth,
        end: endThisMonth
      }

    case 'Today':
      return {
        start: startToday,
        end: endToday
      }

    default:
      console.log('Rango no encontrado')
      process.exit(1)
  }
}

module.exports = { toHHMMSS, getDateRange }
