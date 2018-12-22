const cloud = require('wx-server-sdk')
exports.main = async (event, context) => ({
    sum: event.a + event.b
})
