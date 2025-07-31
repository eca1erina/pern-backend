import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: Int!
    name: String!
    email: String!
  }

  type Transaction {
    id: String!
    user_id: Int!
    type: String!
    category_id: String!
    amount: Float!
    description: String
    date: String!
    is_recurring: Boolean!
    created_at: String!
  }

  type Query {
    getUsers: [User!]!
    getUser(id: Int!): User
    getTransactions(user_id: Int!): [Transaction!]!
    getIncomeTransactions(user_id: Int!): [Transaction!]!
    getExpenseTransactions(user_id: Int!): [Transaction!]!
  }

  type Mutation {
    signupUser(name: String!, email: String!, password: String!): AuthPayload!
    loginUser(email: String!, password: String!): AuthPayload!
    addTransaction(
      user_id: Int!
      type: String!
      category_id: String!
      amount: Float!
      description: String
      date: String!
      is_recurring: Boolean
    ): Transaction!
  }

  type AuthPayload {
    message: String!
    token: String!
    user: User!
  }
`;

export default typeDefs;
