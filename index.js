const express = require('express')
const https = require('https')
const async=require('async')
const fetch = require("node-fetch")

const app = express()
const port = 3000
const noDependenciesString = "no dependencies"
const errorNpmString = "Not Found"
  
let pckgsDic = {}


app.listen(port, () => console.log(`Dependencies service is listening on port ${port}!`))

app.get('/:package', async (req, res) => {
    
    if (pckgsDic[req.params.package] == errorNpmString)
        res.json(errorNpmString)

    else if (!pckgsDic[req.params.package])
        GetNpmDependencies(req.params.package)
            .then(() => {
                res.json(RootTree(req.params.package))
            });

    else 
    {
        console.log("cached")
        res.json(RootTree(req.params.package))
    }
        
})

function GetNpmDependencies(package) {
    return fetch(`https://registry.npmjs.org/${package}/latest`)
        .then(x => x.json())
        .then(x=> {
            console.log(package + x.dependencies)

            if(x == errorNpmString)
                return x
            else if (x.dependencies)
            {                
                pckgsDic[package] = x.dependencies
                for(var propertyName in x.dependencies) {
                    GetNpmDependencies(propertyName)}
            }
            
            else    
                pckgsDic[package] = noDependenciesString
            
            return x
            })
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
