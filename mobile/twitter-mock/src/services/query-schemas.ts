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
  mutation {
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
  mutation {
    addTweet(description: $description, person: $person) {
      description
      likes
      _id
      person {
        age
      }
    }
  }
`;

export {
  QUERY_FOR_TWEETS,
  QUERY_DELETE_TWEET,
  QUERY_FOR_USERS,
  SAVE_TWEET
}