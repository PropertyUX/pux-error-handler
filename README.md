# pux-error-handler

Adds handlers for unhandledRejection and uncaughtException which automatically log to elmah.io and Slack

# Environment 

- process.env.SLACK_WEBHOOK_URL
- process.env.ELMAH_IO_LOG

# Usage

```
const errorHandler = require('pux-error-handler')

errorHandler.use({
  app: require('express')(), // set this to automatically log any Express errors
  application: `Concierge (${process.env.INSTANCE_NAME})`,
  excludedErrors: ['no login token'], // text of errors we don't want to log
  
  // elmah.io specific settings
  elmahLogId: process.env.ELMAH_IO_LOG, // must be set for elmah.io logging

  // Slack specific settings
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL, // must be set for Slack logging
  slackUsername: process.env.SLACK_ERROR_USERNAME, // defaults to 'PuxErrorBot'
  slackChannel: process.env.SLACK_ERROR_CHANNEL, // defaults to '#pux-errors'
  slackEmoji: process.env.SLACK_EMOJI // defaults to ':robot_face:'
})
