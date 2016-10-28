const fs = require('fs')
const glob = require('glob')
const path = require('path')
const modsDir = path.resolve(`${__dirname}/..`)

class ModLoader {
  run(config){
    let cliCommands = []
    config.modLoader = this
    if(config.cli){
      config.cli.addItem = (key,value)=>{
        cliCommands.push([key,value])
      }
    }
    this.mods = this.getMods();
    this.log('Loading mods')
    this.mods.forEach(mod => {
      console.log(' --', mod.package.name)
      mod.module(config)
    })
    if(config.cli) {
      let oldCreateSandbox = config.cli.createSandbox;
      config.cli.createSandbox = function() {
        let sandbox = oldCreateSandbox.apply(this, Array.prototype.slice.call(arguments));
        cliCommands.forEach(c=>sandbox[c[0]] = c[1])
        return sandbox;
      }
    }
  }  

  list(){
    return this.mods.forEach(m=>console.log(m.package.name))
  }

  getMods (cb) {
    try {
      let files = glob.sync('../**/package.json')
      let mods = files.map(f => ({
        dir: path.dirname(f),
        package: require(f)
      })).filter(m => this.hasKeywords(m.package,['screeps','mod']))
      mods.forEach(m => m.module = require(m.dir))
      return mods
    } catch(e) {
      log('failed to load mods')
      throw e
    }
  }

  hasKeywords(pack,keywords){
    return keywords.reduce((w,l)=>l && !!~pack.keywords.indexOf(w),true)
  }

  log(...args) {
    console.log('ModLoader', ...args)
  }

  err(...args) {
    console.error('ModLoader', ...args)
  }
}