import { gql } from "@apollo/client";

export const getUsers = gql`
  query Query {
    Users {
      _id
    }
  }
`;

export const getNfts = gql`
  query Query($address: String!, $tokenAddress: String!) {
    Nfts(address: $address, token_address: $tokenAddress)
  }
`;
