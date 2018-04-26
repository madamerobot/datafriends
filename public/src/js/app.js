import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  createNetworkInterface,
  ApolloClient,
  gql,
  graphql,
  ApolloProvider
} from 'react-apollo'

const client = new ApolloClient({
  createNetworkInterface: createNetworkInterface({
    uri: '/graphql'
  })
})

const graphQLQuery = gql` 
{
  Experiment {
    author
  }
}
`

const getGraphQLEnhancedComponent = graphql(graphQLQuery)

const DataViewer = ({ data: { loading, error, ProposalPage, KpiProposal, ExperimentPage, Experiment } }) => {
  if (loading) return <p>Loading..</p>
  if (error) return <p>{error.message}</p>

  return (
    <div>
      <p>Test</p>
    </div>
  )
}

DataViewer.propTypes = {
  data: PropTypes.object
}

const DataViewerWithData = getGraphQLEnhancedComponent(DataViewer)

class App extends Component {
  render () {
    return (
      <ApolloProvider client={client}>
        <DataViewerWithData />
      </ApolloProvider>
    )
  }
}

export default App
