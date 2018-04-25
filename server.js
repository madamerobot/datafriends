require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')

//Contentful Access Tokini
const spaceId = process.env.SPACE_ID
const cdaToken = process.env.CDA_TOKEN
const cmaToken = process.env.CMA_TOKEN
const port = process.env.PORT

const cfGraphql = require('cf-graphql')
const graphqlHTTP = require('express-graphql')

//====Creating a GraphQL Schema based on CF Content Models=====//

//Initialising new Contentful & GraphQL  Client
const client = cfGraphql.createClient( {spaceId, cdaToken, cmaToken} )

//Fetching Content Model from Contentful
client.getContentTypes()
//Creating GraphQL Schema based on it
.then(cfGraphql.prepareSpaceGraph)
.then(spaceGraph => {
  const names = spaceGraph.map(ct => ct.names.type).join(', ')
  console.log(`Contentful content types prepared: ${names}`)
  return spaceGraph
})
.then(cfGraphql.createSchema)
//Start Server which uses GraphQL Schema
.then(schema => startServer(client, schema))


//====Spinning up GraphQL Server====//

function startServer (client, schema) {

  const app = express()
  app.use(cors())

  // serve React Frontend
  app.use('/client', express.static(path.join(__dirname, 'dist')))

  // ship own GraphiQL to be completely flexible
  const ui = cfGraphql.helpers.graphiql({title: 'datafriends'})
  app.get('/', (_, res) => res.set(ui.headers).status(ui.statusCode).end(ui.body))

  // enable GraphQL extension to retrieve GraphQL versoin and
  // detailed HTTP request information
  const opts = {version: true, timeline: true, detailedErrors: false}
  const ext = cfGraphql.helpers.expressGraphqlExtension(client, schema, opts)
  app.use('/graphql', graphqlHTTP(ext))

  // app.use('/graphql', graphqlHTTP({
  //   context: {entryLoader: client.createEntryLoader()},
  //   graphql: true,
  //   schema,
  // }))

  app.listen(port)

  console.log(`🌟 Running a GraphQL server, listening on port ${port}🌟`)
}