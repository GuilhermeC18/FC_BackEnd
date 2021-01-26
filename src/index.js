const { GraphQLServer } = require('graphql-yoga')
const { PrismaClient } = require('@prisma/client');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const prisma = new PrismaClient()


const typeDefs = `
  type Movie {
    id      :ID!
    movieTitle    :String!
    Transaction: [Transaction] 
  }
  type Transaction {
    id  :ID! 
    date  : String!
    amountCurrency: String! 
    territory     :Territory 
    amountValue  :Int!
    collectionSource :CollectionSource
    collectionSourceType :CollectionSourceType
    movie  :Movie!
  }
  type Territory {
    id  :ID!
    name :String!
    Transactions: [Transaction]
  }
  type CollectionSource {
    id  :ID!
    name :String!
    Transactions: [Transaction]
  }
  type CollectionSourceType {
    id  :ID!
    name :String!
    Transactions: [Transaction]
  }
  type Query {
    
    movie(id: ID!): Movie
    territory(id: ID!): Territory
    collectionSource(id: ID!): CollectionSource
    collectionSourceType(id: ID!): CollectionSourceType
    transactions: [Transaction]
  }
  type Mutation {
    addMovie(
      movieTitle: String!
    ) : Movie
    addTransaction(
      id: ID!
      date: String!
      movieId: ID! 
      territoryId: ID! 
      collectionSourceId: ID!
      collectionSourceTypeId: ID! 
    ): Transaction
    addTerritory(
      name: String!
    ): Territory 
    addCollectionSource(
      name: String! 
    ): CollectionSource
    addCollectionSourceType(
      name: String!
    ): CollectionSourceType 
  }
`;
//find a movie / add a movie 
//find all transactions from a movie 
//find all transactions from a movie and from a territory 
//find all transactions from a movie and from a source
//find all transactions from a movie and from a sourceType 
const resolvers = {
  Query: {
    movie: async (parent, args, context) =>{  
      return context.prisma.movie.findUnique({
        where: {
          id: parseInt(args.id)
        },
        include: { Transaction: true}
      })
    },
  },
  Mutation: {
    addMovie: (parent, args, context, info) => {
        const newMovie = context.prisma.movie.create({
        data: {
          movieTitle: args.movieTitle,
        },
      })
      return newMovie
    },
  }, 
  
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: {
    prisma,
  }
})

const options = {
  port: 8000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
}
server.start(options, ({ port }) =>
  console.log(
    `Server started, listening on port ${port} for incoming requests.`,
  ),
)