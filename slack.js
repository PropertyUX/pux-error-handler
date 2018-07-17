const SlackWebhook = require('slack-webhook')
const _ = require('lodash')

var option = {}

var slack = new SlackWebhook(process.env.SLACK_WEBHOOK_URL, {
  defaults: {
    username: 'BadNewsBot',
    channel: '#pux-errors',
    icon_emoji: ':robot_face:'
  }
})

function use (opt) {
  option = opt
}

function send (err, extra) {
  var payload = {text: `Error on *${option.application}*: ${err.message}`}

  if (_.has(extra, 'location')) {
    payload.text += `\nLocation: ${extra.location}`
    payload.unfurl_media = false
  }

  return slack.send(payload)
}

module.exports = { send, use }