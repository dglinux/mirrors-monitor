/** InfluxDB v2 URL */
const url = process.env['INFLUX_URL'] || 'http://localhost:8086'
/** InfluxDB authorization token */
const token = process.env['INFLUX_TOKEN'] || 'TOKEN=='
/** Organization within InfluxDB  */
const org = process.env['INFLUX_ORG'] || 'dglinux'
/**InfluxDB bucket used in examples  */
const bucket = process.env['INFLUX_BUCKET'] || 'mirrors'

module.exports = {
  url,
  token,
  org,
  bucket,
}
