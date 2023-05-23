import { gql } from "@apollo/client";

export const checkUser = gql`
  mutation Mutation($payload: CreateUserInput!) {
    checkUser(payload: $payload) {
      _id
      name
      role
      wallet
    }
  }
`;