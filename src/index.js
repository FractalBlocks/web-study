const htmlAnalyzer = require('html-analyzer')
const config = require('./config')
const fs = require('fs')

function mergeResults (target, origin) {
  let result = {}
  let keysTarget = Object.keys(target)
  let i
  for (i = 0, len = keysTarget.length; i < len; i++) {
    result[keysTarget[i]] = target[keysTarget[i]]
  }
  let keysOrigin = Object.keys(origin)
  for (i = 0, len = keysOrigin.length; i < len; i++) {
    if (result.hasOwnProperty(keysOrigin[i])) {
      result[keysOrigin[i]] += origin[keysOrigin[i]]
    } else {
      result[keysOrigin[i]] = origin[keysOrigin[i]]
    }
  }
  return result
}

async function run () {
  let results = {}
  let resume = {}
  let numUrls = config.urls.length
  for (let i = 0, len = config.urls.length; i < len; i++) {
    results[config.urls[i]] = await new Promise((resolve, reject) => {
      htmlAnalyzer(config.urls[i], insights => resolve(insights))
    })
    resume = mergeResults(resume, results[config.urls[i]].elementCount)
  }
  let orderedResume = []
  let resumeKeys = Object.keys(resume)
  for (let i = 0, len = resumeKeys.length; i< len; i++) {
    orderedResume[i] = [resumeKeys[i], resume[resumeKeys[i]]]
  }
  return [
    orderedResume.sort((a, b) => b[1] - a[1]),
  ]
}

run().then(results => {
  console.log(results)
  fs.writeFile('results/index.json', JSON.stringify(results, null, 4))
})
