require('dotenv').config()

const api_url = process.env.api_url
const api_key = process.env.api_key

console.log(api_url)
console.log(api_key)

console.log(`curl -H "content-type: application/json" -H "X-Api-Key: ${api_key}" -X GET ${api_url}/user`