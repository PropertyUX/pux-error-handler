// version of https://github.com/elmahio/elmah.io.express/blob/master/lib/index.js
// modified to be called manually
const request = require('request')
const _ = require('lodash')

var site = 'https://elmah.io/api/v2/messages'
var option = {}

function parseCookies (request) {
  var list = []

  if (request && request.headers) {
    const rc = request.headers.cookie

    rc && rc.split(';').forEach(function (cookie, index) {
      var parts = cookie.split('=')
      list[index] = {key: parts.shift().trim(), value: decodeURI(parts.join('='))}
    })
  }

  return list
}
function parseData (data) {
  var list = []
  var i = 0
  for (var key in data) {
    list[i] = {key: key, value: data[key]}
    i++
  }
  return list
}

function send (err, req, next) {
  if (!option.elmahLogId) return Promise.resolve() // keep our caller happy
  req = req || err.req
  if (req) {
    var cookie = parseCookies(req)
    var form = parseData(req.body)
    var queryString = parseData(req.query)
    if (req.socket) {
      var serverVariables = parseData({port: req.socket.address().port.toString()})
    }

    var fullUrl = ''

    if (req.get) {
      var host = req.get('host')
      fullUrl = req.protocol + '://' + host
    }

    fullUrl += req.originalUrl
  }
  var severity = 'Error'
  var obj = {
    title: (err && err.message) || 'Express Error',
    source: null,
    application: option.application || null,
    detail: (err && err.stack ? err.stack : 'no stack') || null,
    hostname: host || null,
    cookies: cookie || null,
    data: null,
    form: form || null,
    queryString: queryString || null,
    serverVariables: serverVariables || null,
    statusCode: (err && (err.status || err.statusCode || err.errorCode)) || null,
    severity: severity || null,
    type: 'Error',
    url: fullUrl || null,
    user: option.elamhUsername || null,
    version: option.version || null
  }
  var conf = {
    url: site,
    qs: {logid: option.elmahLogId},
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    json: obj
  }
  var ret = sendError(conf)

  err.sent = true

  if (_.isFunction(next)) next()

  return ret
}

function auto () {
  return function autosend (err, req, res, next) { return send(err, req, next) }
}

function use (opt) {
  option = opt

  if (!option.elmahLogId)
    console.log('No elmahLogId value provided') // warning only
}

function sendError (conf) {
  return new Promise((resolve, reject) => {
      request(conf, function (error, response) {
        if (error) return reject(error)
        if (_.get(response, 'statusCode') !== 201) {
          return reject(new Error(response.statusMessage))
        }
        return resolve(response)
      })
    })
}


module.exports = { send, auto, use }