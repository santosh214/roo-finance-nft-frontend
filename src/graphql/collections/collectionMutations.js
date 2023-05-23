import { gql } from "@apollo/client";

export const createCollection = gql`
  mutation Mutation($payload: CreateCollectionInput!) {
    createCollection(payload: $payload) {
      _id
      contract_address
      description
      name
      symbol
      creator_address
      collection_address
      token_address
      picture
    }
  }
`;

export const updateCollection = gql`
  mutation UpdateCollection($payload: UpdateCollectionInput!) {
    updateCollection(payload: $payload) {
      _id
      timeStamp
      expire_date
      collection_address
      contract_address
      creator_address
      description
      name
      picture
      symbol
      token_address
    }
  }
`;