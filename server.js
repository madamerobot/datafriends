require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')

// Contentful Access Tokini
const spaceId = process.env.SPACE_ID
const cdaToken = process.env.CDA_TOKEN
const cmaToken = process.env.CMA_TOKEN
const port = process.env.PORT

const cfGraphql = require('cf-graphql')
const graphqlHTTP = require('express-graphql')

function createSchemaFromCF () {
  // Initialising new Contentful & GraphQL  Client
  const client = cfGraphql.createClient({ spaceId, cdaToken, cmaToken })

  // Fetching Content Model from Contentful
  client.getContentTypes()
    // Creating GraphQL Schema based on it
    .then(cfGraphql.prepareSpaceGraph)
    .then(spaceGraph => {
      const names = spaceGraph.map(ct => ct.names.type).join(', ')
      console.log(`Contentful content types prepared: ${names}`)
      return spaceGraph
    })
    .then(cfGraphql.createSchema)
    // Start Server which uses GraphQL Schema
    .then(schema => startGraphQLServer(client, schema))
    .catch(fail)
}

function startGraphQLServer (client, schema) {

  const app = express()
  app.use(cors())

  // Serve React Frontend
  app.use('/public', express.static(path.join(__dirname, 'dist')))

  // Enable GraphQL extension to retrieve GraphQL version and
  // detailed HTTP request information
  const opts = {version: true, timeline: true, detailedErrors: true}
  const ext = cfGraphql.helpers.expressGraphqlExtension(client, schema, opts)
  app.use('/graphql', graphqlHTTP(ext))

  // Ship own GraphiQL to be completely flexible
  const ui = cfGraphql.helpers.graphiql({ title: 'Graphiql' })
  app.get('/', (_, res) => res.set(ui.headers).status(ui.statusCode).end(ui.body))

  app.listen(port)

  console.log(`🌟 Running a GraphQL server, listening on port ${port}🌟`)
}

function fail (err) {
  console.log(err)
  process.exit(1)
}

createSchemaFromCF()