
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./remark-fetch-code.cjs.production.min.js')
} else {
  module.exports = require('./remark-fetch-code.cjs.development.js')
}
