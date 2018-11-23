const express = require('express')
const async=require('async')
var request = require("request");

const app = express()
const port = 3000
const noDependenciesString = "no dependencies"
const errorNpmString = "Not Found"
  
let pckgsDic = {}
app.listen(port, () => console.log(`Dependencies service is listening on port ${port}! \nUsing example: 127.0.0.1:${port}/express`))

app.get('/:package', async (req, res) => {

    if (pckgsDic[req.params.package])
    {
        res.json(RootTree(req.params.package))
        console.log("cached")
    }
    else
        GetNpmDependencies(req.params.package)
            .then(function(x) {
                res.json(RootTree(req.params.package))
                console.log('works')
            }).catch(function(err) {
                console.log(err.stack)
            })        
})

function GetNpmDependencies(package) {
    // Setting URL and headers for request
    var options = {
        url: `https://registry.npmjs.org/${package}/latest`,
        headers: {
            'User-Agent': 'request'}
      };
    
    // Return new promise 
    return new Promise(function(resolve, reject) {
        request.get(options, function(err, resp, package) {
            if (err) {
                reject(err);
            } else {
                json = JSON.parse(package)            
                if (json.dependencies)
                {
                    pckgsDic[json.name] = json.dependencies
                    array = []
                    for(var propertyName in json.dependencies) {
                        if (!pckgsDic[propertyName])
                            array.concat(GetNpmDependencies(propertyName))}
                    resolve(Promise.all(array))
                }

                else 
                {
                    pckgsDic[json.name] = noDependenciesString
                    resolve(json)
                }
            }
        })
    })
}


var errHandler = function(err) {
    console.log(err);
}

function RootTree(package){
    let result = {} 

    result[package] = pckgsDic[package]

    if (result[package] == noDependenciesString)
        return noDependenciesString

    for (var propertyName in result[package])
        result[package][propertyName] = RootTree(propertyName)        

    return result[package]
}

