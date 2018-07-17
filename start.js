'use strict'

const elmah = require('./elmah')
var slack = require('./slack')
const _ = require('lodash')

var platforms = [elmah, slack]

// array of messages we don't want logged
var excludedErrors = []

var unhandledRejectionHandler, rejectionHandledHandler, uncaughtExceptionHandler

async function sendToAll () {
  try {
    var args = [].slice.call(arguments);

    var elmahResult = await elmah.send(...arguments)
    .catch((err) => {
      console.log(`elmah.io POST for '${args[0]}' returned '${err}'`)
    })

    if (elmahResult) {
      var location = _.get(elmahResult, 'headers.location')

      if (location) {
        args.push({location})
      }
    }

    slack.send(...args)
    .catch((err) => {
      console.log(`Slack send for '${args[0]}' returned '${err}'`)
    })
  } catch (err) {
      console.log(`Exception in sendToAll: ${err}`)
  }
}

function use(args) {
  if (!(_.has(args, 'logId'))) return this

  platforms.forEach((p) => p.use(args))

  if (args.app && args.constructor === Function) {
    args.app.use(elmah.auto())
  }

  excludedErrors = args.excludedErrors || []
  
  function logError (err) {
    if (err && excludedErrors.findIndex((error) => error.toLowerCase() === err.message.toLowerCase()) === -1) {
      sendToAll(err)
    }
  }

  if (!unhandledRejectionHandler) {
    const unhandledRejections = new Map()
  
    unhandledRejectionHandler = process.on('unhandledRejection', (reason, promise) => {

      unhandledRejections.set(promise, reason)

      if (_.has(reason, 'message')) {
        var err = reason
      } else if (_.has(promise, 'exception')) {
        err = promise.exception
      }

      if (err) {
        console.error(err)

        if (!err.sent) logError(err)
      }
    })
  }

  if (!rejectionHandledHandler) {
      rejectionHandledHandler = process.on('rejectionHandled', (promise) => {
      unhandledRejections.delete(promise)
    })
  }

  if (!uncaughtExceptionHandler)
  {
    uncaughtExceptionHandler = process.on('uncaughtException', (err) => {
      console.log(`***** uncaughtException: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`)
      if (err) logError(err)
    })
  }

  return this
}

module.exports = {
  use,
  send() { sendToAll(...arguments) } 
}