import { View, StyleSheet, Text, Pressable, Platform } from "react-native";
import ITweet from "../interfaces/tweet";
import { EvilIcons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import showToast from "../services/toast";
import UseCustomFetch from "../services/useCustomFetch";
import { QUERY_DELETE_TWEET, QUERY_LIKE_TWEET } from "../services/query-schemas";
import { Dispatch, SetStateAction } from "react";

export default function TweetCard({ details, deleteTweetInList, openProfile, setTweets }: { details: ITweet, deleteTweetInList: (id: String) => void, openProfile: (id: String) => void, setTweets: Dispatch<SetStateAction<ITweet[]>> }) {

  const formatTwitterCount = function (count: number) {
    if (count < 1000) {
      return count;
    }
    if (count >= 1000 && count < 1000000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
  }

  const deleteTweet = async function (id: String) {
    const response = await UseCustomFetch(QUERY_DELETE_TWEET, { id });

    if (response.errors) {
      showToast({ msg: "Action failed", danger: true })
      return
    }

    deleteTweetInList(id);
    showToast({ msg: "Tweet deleted" })
  }

  const likeTweet = async function (id: String) {
    const response = await UseCustomFetch(QUERY_LIKE_TWEET, { id });

    if (response.errors) {
      showToast({ msg: "Action failed", danger: true })
      return
    }

    setTweets(prevTweets => prevTweets.map(tweet => {
      if (tweet._id === id) {
        tweet.likes = response.data.likeTweet.likes
      }
      return tweet;
    }))
  }

  return (
    <View style={ styles.tweetCard }>
      <View style={styles.tweetHeader}>
        <Text style={{ ...styles.fontFam, ...styles.name }}>@{ details.person.name} - { details.person.email }</Text>
        {/* opens profile modal */}
        <Pressable onPress={() => openProfile(details.person._id)}> 
          <EvilIcons name="external-link" size={24} color="black" />
        </Pressable>
      </View>
      <Text style={{ ...styles.fontFam, ...styles.tweet }}>{ details.description }</Text>
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Pressable onPress={() => likeTweet(details._id)}>
            <AntDesign name="like2" size={24} color="black" />
          </Pressable>
          <Text style={{ ...styles.fontFam, ...styles.likesCount }}>{ formatTwitterCount(details.likes) }</Text>
        </View>
        {/* deletes tweet */}
        <View>
          <Pressable onPress={() => deleteTweet(details._id)}>
            <MaterialIcons name="delete-outline" size={24} color="black" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fontFam: {
    fontFamily: "DMSans-Regular"
  },
  tweetCard: {
    borderWidth: 1,
    elevation: 1.5,
    padding: 10,
    margin: 10,
  },
  tweet: {
    color: "black",
    fontSize: 16,
  },
  name: {
    fontSize: 14,
    color: 'grey'
  },
  tweetHeader: {
    marginBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15
  },
  likesCount: {
    fontSize: 14,
    marginLeft: 10
  },
  footerContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
})