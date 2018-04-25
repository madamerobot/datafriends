require('dotenv').config()
const express = require('express')
const app = express()

//Pulling in Contentful Access Token
const spaceId = process.env.SPACE_ID
const cdaToken = process.env.CDA_TOKEN
const cmaToken = process.env.CMA_TOKEN
const port = process.env.PORT

const cfGraphql = require('cf-graphql')
//Setting up Express/GraphQL Server
const graphqlHTTP = require('express-graphql')

//====Create a GraphQL Schema=====//

//Creating a new Contentful Client

const client = cfGraphql.createClient( {spaceId, cdaToken, cmaToken} )

//Fetching Content Model from CF
client.getContentTypes()
//Creating GraphQL Model based on it
.then(cfGraphql.prepareSpaceGraph)
.then(spaceGraph => {
  const names = spaceGraph.map(ct => ct.names.type).join(', ')
  console.log(`Contentful content types prepared: ${names}`)
  return spaceGraph
})
.then(cfGraphql.createSchema)
//Start Server which uses GpraphQL model, connected to 
//CF client
.then(schema => startServer(client, schema))


//====Spin up GraphQL Server====//

function startServer (client, schema) {

  app.use('/graphql', graphqlHTTP({
    context: {entryLoader: client.createEntryLoader()},
    graphql: true,
    schema,
  }))

  app.listen(port)
  console.log(`🌟 Running a GraphQL server, listening on port ${port}🌟`)
}