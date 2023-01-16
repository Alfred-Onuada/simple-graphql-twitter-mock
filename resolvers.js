import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import { withFilter, PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();
const client = new MongoClient(process.env.DB_URI);
const db = client.db('twitter');

// Use try catch for best pratices

const resolvers = {
  Query: {
    getPerson: async (parent, { _id }) => {
      const person = await db.collection('people').findOne({ _id: ObjectId(_id) });

      if (person !== null) {
        return person;
      } else {
        throw new Error("Invalid person Id")
      }
    },
    people: async () => {
      const cursor = db.collection('people').find();
      const people = await cursor.toArray();

      return people;
    },
    getTweet: async (parent, { _id }) => {
      const tweet = await db.collection('tweets').findOne({ _id: ObjectId(_id) });

      if (tweet !== null) {
        return tweet;
      } else {
        throw new Error("Invalid tweet Id");
      }
    },
    tweets: async () => {
      const cursor = db.collection('tweets').find();
      const tweets = await cursor.toArray();

      return tweets;
    }
  },
  Mutation: {
    addPerson: async (parent, { name, email, age, bio }) => {
      const person = { name, email, age, bio };
      const response = await db.collection('people').insertOne(person);

      if (response.acknowledged) {
        person._id = response.insertedId;

        return person;
      } else {
        throw new Error("Person creation failed");
      }
    },
    deletePerson: async (parent, { _id }) => {
      const person = await db.collection('people').findOne({ _id: ObjectId(_id) });

      if (person == null) {
        throw new Error("No such user exists");
      }
      
      const response = await db.collection('people').deleteOne({ _id: ObjectId(_id) });
      await db.collection('tweets').deleteMany({ person: ObjectId(_id) })

      if (response.acknowledged && response.deletedCount > 0) {
        return person; // the person document gotten above
      } else {
        throw new Error("There was a problem deleting");
      }
    },
    addTweet: async (parent , { description, person }) => {
      if (!ObjectId.isValid(person)) {
        throw new Error("Invalid id for person");
      }

      const tweet = { description, person: ObjectId(person) };
      const response = await db.collection('tweets').insertOne(tweet);

      if (response.acknowledged) {
        tweet._id = response.insertedId;

        // most likely bad pratice but I'm not sure what the correct way to solve it is
        pubsub.publish('TWEET_ADDED', { newTweetAdded: tweet, newTweetAddedFromSpecificUser: tweet })
        return tweet;
      } else {
        throw new Error("Failed to add tweet");
      }
    },
    deleteTweet: async (parent, { _id }) => {
      const tweet = await db.collection('tweets').findOne({ _id: ObjectId(_id) });

      if (tweet == null) {
        throw new Error("No tweet exists");
      }
      
      const response = await db.collection('tweets').deleteOne({ _id: ObjectId(_id) });

      if (response.acknowledged && response.deletedCount > 0) {
        return tweet; // the tweet document gotten above
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

          const person = await db.collection('people').findOne({ _id: ObjectId(personToListenTo) });
          
          if (person === null) {
            throw new Error("Cannot listen to a non existent user");
          }

          const shouldListen = (new ObjectId(personToListenTo)).equals(tweetPayload.newTweetAddedFromSpecificUser.person);

          return shouldListen;
        }
      )
    }
  },
  Person: {
    lastFiveTweets: async ({ _id }) => {
      const cursor = db.collection('tweets').find({ person: _id }).limit(5);
      const tweets = await cursor.toArray();

      return tweets;
    }
  },
  Tweet: {
    person: async ({ person:person_id }) => {
      // note the person is from mongoDb schema not graphQL,
      // basically the parent object contains the payload of the previous stage

      const person = await db.collection('people').findOne({ _id: ObjectId(person_id) });

      return person;
    },
    likes: async ({ _id, likes }) => {

      if (likes) {
        return likes;
      } else {
        let likes = Math.ceil(Math.random() * 1_000_000);

        await db.collection('tweets').updateOne({ _id: ObjectId(_id) }, { $set: { likes } })
        return likes;
      }
    }
  }
}

export default resolvers;