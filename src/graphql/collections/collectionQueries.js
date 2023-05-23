import { gql } from "@apollo/client";

export const getCollections = gql`
  query Query {
    Collections {
      _id
      contract_address
      creator_address
      collection_address
      token_address
      description
      name
      symbol
      picture
      timeStamp
      expire_date
    }
  }
`;

export const collectionData = gql`
  query Collections($filters: ListCollectionInput) {
    Collections(filters: $filters) {
      _id
      collection_address
      contract_address
      creator_address
      description
      name
      picture
      symbol
      token_address
      timeStamp
      expire_date
    }
  }
`;
export const getMultipleNfts = gql`
  query Query($address: String!, $tokens: [String!]!) {
    GetMultiNfts(address: $address, tokens: $tokens)
  }
`;
