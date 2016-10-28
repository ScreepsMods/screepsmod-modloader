const ModLoader = require('./lib/ModLoader.js')

let ml = new ModLoader()
module.exports = config=>ml.run(config)