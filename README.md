# pux-error-handler

Adds handlers for unhandledRejection and uncaughtException which automatically log to elmah.io and Slack

# Environment 

- process.env.SLACK_WEBHOOK_URL
- process.env.ELMAH_IO_LOG

# Usage

```
const errorHandler = require('pux-error-handler')

errorHandler.use({
  app: require('express')(),
  logId: process.env.ELMAH_IO_LOG,
  excludedErrors: ['no login token'],
  application: `Concierge (${process.env.INSTANCE_NAME})`})
```
