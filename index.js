const express = require('express')
const async=require('async')
const fetch = require("node-fetch")

const app = express()
const port = 3000
const noDependenciesString = "no dependencies"
const errorNpmString = "Not Found"
  
let pckgsDic = {}
app.listen(port, () => console.log(`Dependencies service is listening on port ${port}! \nUsing example: 127.0.0.1:3000/express`))

app.get('/:package', function (req, res) {
    
    if (!pckgsDic[req.params.package]){        
        GetNpmDependencies(req.params.package)
            .then(res.json(RootTree(req.params.package)));
    }

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
            if (x.dependencies)
            {                
                pckgsDic[package] = x.dependencies
                for(var propertyName in x.dependencies) {
                    if (!pckgsDic[package])
                        GetNpmDependencies(propertyName)}
            }
            
            else    
                pckgsDic[package] = noDependenciesString
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
