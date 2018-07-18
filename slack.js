const SlackWebhook = require('slack-webhook')
const _ = require('lodash')

var option = {}

function use (opt) {
  option = opt

  if (!option.slackWebhookUrl)
    console.log('No slackWebhookUrl value set') // warning only
}

function send (err, extra) {
  if (!option.slackWebhookUrl) return Promise.resolve() // keep our caller happy

  var slack = new SlackWebhook(option.slackWebhookUrl, {
    defaults: {
      username: option.slackUsername || 'PuxErrorBot',
      channel: option.slackChannel || '#pux-errors',
      icon_emoji: option.slackEmoji || ':robot_face:'
    }
  })
  
  var payload = {text: `*${option.application}*: ${err.message}`}

  if (_.has(extra, 'location')) {
    payload.text += `\nLocation: ${extra.location}`
    payload.unfurl_media = false
  }

  return slack.send(payload)
}

module.exports = { send, use }