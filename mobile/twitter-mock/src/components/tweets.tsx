import { useSubscription } from "@apollo/client";
import { useState } from "react";
import { FlatList } from "react-native";
import ITweet from "../interfaces/tweet";
import { NEW_TWEET_SUB } from "../services/query-schemas";
import showToast from "../services/toast";
import TweetCard from "./tweet-card";

export default function Tweets({ initialTweets, openProfile }: { initialTweets:ITweet[], openProfile: (id: String) => void }) {

  const [tweets, setTweets] = useState<ITweet[]>(initialTweets);

  const updateTweets = function () {
    const data = arguments[0].data.data;

    setTweets([ data.newTweetAdded, ...tweets ]);
  }

  // subscribe to new tweets
  const { error:tweetSubError  } = useSubscription(NEW_TWEET_SUB, {
    fetchPolicy: 'network-only',
    onData: updateTweets
  })

  if (tweetSubError) {
    showToast({ msg: "Connection to server was lost", danger: true });
  }

  const deleteTweetInList = function (id: String) {
    setTweets(prevTweets => {
      let tweets = prevTweets.filter((tweet: ITweet) => tweet._id !== id) 

      return tweets;
    })
  };

  return (
    <FlatList
      data={tweets}
      renderItem={({ item }) => (
        <TweetCard
          details={item}
          deleteTweetInList={deleteTweetInList}
          openProfile={openProfile}
          setTweets={setTweets} />
      )}
    />
  )

}

function useCallBack(arg0: () => void) {
  throw new Error("Function not implemented.");
}
