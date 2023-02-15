import { withFilter, PubSub } from "graphql-subscriptions";
import Person from "./models/person.model.js";
import Tweet from "./models/tweet.model.js";

const pubsub = new PubSub();

// Use try catch for best pratices

const resolvers = {
  Query: {
    getPerson: async (parent, { _id }) => {
      const person = await Person.findOne({ where: { _id: _id } });

      if (person !== null) {
        return person.dataValues;
      } else {
        throw new Error("Invalid person Id")
      }
    },
    people: async () => {
      const people = await Person.findAll();

      return people;
    },
    getTweet: async (parent, { _id }) => {
      const tweet = await Tweet.findOne({ where: { _id: _id } });

      if (tweet !== null) {
        return tweet.dataValues;
      } else {
        throw new Error("Invalid tweet Id");
      }
    },
    tweets: async () => {
      const tweets = await Tweet.findAll({ order: [['createdAt', 'DESC']] });
      
      return tweets;
    }
  },
  Mutation: {
    addPerson: async (parent, { name, email, age, bio }) => {
      const person = { name, email, age, bio };
      const response = await Person.create(person);

      if (response.dataValues._id) {
        return response.dataValues;
      } else {
        throw new Error("Person creation failed");
      }
    },
    deletePerson: async (parent, { _id }) => {
      const person = await Person.findOne({ where: { _id: _id } });

      if (person == null) {
        throw new Error("No such user exists");
      }
      
      // the force option actually deletes the record else it will just mark it as deleted
      await Tweet.destroy({ where: { person: _id }, force: true }); // this order is important because person is a foreign and will be auto removed
      const response = await Person.destroy({ where: { _id: _id }, force: true });

      if (response == 1) {
        return person.dataValues; // the person document gotten above
      } else {
        throw new Error("There was a problem deleting");
      }
    },
    addTweet: async (parent , { description, person }) => {
      const tweet = { description, person };
      const response = await Tweet.create(tweet);

      if (response.dataValues._id) {

        // most likely bad pratice but I'm not sure what the correct way to solve it is
        pubsub.publish('TWEET_ADDED', { newTweetAdded: response.dataValues, newTweetAddedFromSpecificUser: response.dataValues })
        return response.dataValues;
      } else {
        throw new Error("Failed to add tweet");
      }
    },
    deleteTweet: async (parent, { _id }) => {
      const tweet = await Tweet.findOne({ where: { _id: _id } });

      if (tweet == null) {
        throw new Error("No tweet exists");
      }
      
      const response = await Tweet.destroy({ where: { _id: _id }, force: true });

      if (response == 1) {
        return tweet.dataValues; // the tweet document gotten above
      } else {
        throw new Error("There was a problem deleting tweet");
      }
    }
  },
  Subscription: {
    newTweetAdded: {
      subscribe: () => {
        return pubsub.asyncIterator('TWEET_ADDED')
      }
    },
    newTweetAddedFromSpecificUser: {
      subscribe: withFilter(
        () => {
          return pubsub.asyncIterator(`TWEET_ADDED`);
        },
        // is this is true it will send the event else it won't
        async (tweetPayload, { _id:personToListenTo }) => { 

          const person = await Person.findOne({ where: { _id: personToListenTo } });
          
          if (person === null) {
            throw new Error("Cannot listen to a non existent user");
          }

          const shouldListen = personToListenTo == tweetPayload.newTweetAddedFromSpecificUser.person;

          return shouldListen;
        }
      )
    }
  },
  Person: {
    lastFiveTweets: async ({ _id }) => {
      const tweets = await Tweet.findAll({ where: { person: _id }, limit: 5, order: [["createdAt", "DESC"]] })

      return tweets;
    }
  },
  Tweet: {
    person: async ({ person:person_id }) => {
      // note the person is from mongoDb schema not graphQL,
      // basically the parent object contains the payload of the previous stage

      const person = await Person.findOne({ where: { _id: person_id } });

      return person.dataValues;
    },
  }
}

export default resolvers;