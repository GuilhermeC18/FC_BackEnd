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
    territory     :String! 
    amountValue  :Int!
    collectionSource :String!
    collectionSourceType :String!
    movie  :Movie!
  }
  type Query {
    
    movie(id: ID!): Movie
    transactions: [Transaction]
  }
  type Mutation {
    addMovie(
      movieTitle: String!
    ) : Movie
    addTransaction(
      date: String!
      amountCurrency: String!
      territory :String!
      amountValue : Int!
      collectionSource :String! 
      collectionSourceType :String!
      id: ID!
    ): Transaction
  }
`;
//find a movie / add a movie 
//add transactions / find all transactions from a movie 

const resolvers = {
  Query: {
    movie: async (parent, args, context) =>{  
      console.log("query", context.prisma);
      return context.prisma.movie.findUnique({
        where: {
          id: parseInt(args.id)
        },
        include: { Transaction: true}
      })
    },
    transactions: async (parent, args, context) => {
      return context.prisma.transaction.findMany({
        include: {
          movie: true
        }
      })
    }
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
    addTransaction: (parent, args, context, info) => {
       console.log(args);
       const newTransaction = context.prisma.transaction.create({
        data: {
          date: args.date,
          amountCurrency: args.amountCurrency,
          territory: args.territory,
          amountValue: parseInt(args.amountValue),
          collectionSource: args.collectionSource,
          collectionSourceType: args.collectionSourceType,
          movie: {
            connect: { id: parseInt(args.id) }
          },
        }
      })
      return newTransaction;
    },
  }
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


//Add a transaction example: 
/*
mutation {
  addTransaction(
      date: "2017-07-16T19:20:30.451Z"
      amountCurrency:"EUR"
      territory:"Germany"
      amountValue: 100000
      collectionSource:"Warner Bros."
      collectionSourceType:"Box Office"
      id: "1"
    ){
      id
      date
      amountCurrency
      territory
      amountValue
      collectionSource
      collectionSourceType
      
    }
  }
*/

//Get all transactions example: 
/*
query {
  transactions {
    date
    amountCurrency
    territory
    amountValue
    collectionSource
    collectionSourceType
    movie {
      id
      movieTitle
    }
  }
} */

//All transactions from one movie 
/* 

query {
  movie (id: 1){
    id
    movieTitle
    Transaction {
      id
      date
      amountValue
      territory
      amountCurrency
      collectionSource
      collectionSourceType
    }
  }
}

*/