import { gql } from "@apollo/client";

const QUERY_FOR_TWEETS = gql`
  query {
    tweets {
      _id
      description
      likes
      person {
        _id
        name
        email
      }  
    }
  }
`;

const QUERY_DELETE_TWEET = `#graphql
  mutation DeleteTweet($id: ID!) {
    deleteTweet(_id: $id) {
      description
    }
  }
`;

const QUERY_LIKE_TWEET = `#graphql
  mutation LikeTweet($id: ID!) {
    likeTweet(_id: $id) {
      likes
    }
  }
`;

const QUERY_FOR_USERS = gql`
  query {
    people {
      _id
      name
    }
  }
`;

const SAVE_TWEET = `#graphql
  mutation SaveTweet($description: String!, $person: ID!) {
    addTweet(description: $description, person: $person) {
      _id
      description
      likes
      person {
        _id
        name
        email
      }  
    }
  }
`;

const QUERY_FOR_PERSON = `#graphql
  query GetPerson($id: ID!) {
    getPerson(_id: $id) {
      _id
      age
      bio
      email
      name
    }
  }
`;

const PERSONAL_SUBSCRIPTION_QUERY = gql`
  subscription newTweetAddedFromSpecificUser($id: ID!) {
    newTweetAddedFromSpecificUser(_id: $id) {
      description
      person {
        name
      }
    }
  }
`;

const NEW_TWEET_SUB = gql`
  subscription newTweetSub {
    newTweetAdded {
      _id
      description
      likes
      person {
        _id
        name
        email
      }  
    }
  }
`;

export {
  QUERY_FOR_TWEETS,
  QUERY_DELETE_TWEET,
  QUERY_FOR_USERS,
  SAVE_TWEET,
  QUERY_FOR_PERSON,
  QUERY_LIKE_TWEET,
  PERSONAL_SUBSCRIPTION_QUERY,
  NEW_TWEET_SUB
}