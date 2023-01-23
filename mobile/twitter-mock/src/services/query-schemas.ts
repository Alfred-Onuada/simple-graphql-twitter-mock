const QUERY_FOR_TWEETS = `#graphql
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

const QUERY_FOR_USERS = `#graphql
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

const PERSONAL_SUBSCRIPTION_QUERY = `#graphql
  subscription newTweetAddedFromSpecificUser($id: ID!) {
    newTweetAddedFromSpecificUser(_id: $id) {
      description
      person {
        name
      }
    }
  }
`;

const NEW_TWEET_SUB = `#graphql
  subscription newTweetSub {
    newTweetAdded {
      description
      person {
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
  PERSONAL_SUBSCRIPTION_QUERY,
  NEW_TWEET_SUB
}