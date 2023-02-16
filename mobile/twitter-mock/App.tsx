import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar as rnStatusBar, Platform } from 'react-native';
import { loadAsync } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Loading from './src/components/loading';
import UseCustomFetch from './src/services/useCustomFetch';
import ITweet from './src/interfaces/tweet';
import { RootSiblingParent } from 'react-native-root-siblings';
import showToast from './src/services/toast';
import { ApolloProvider, InMemoryCache, ApolloClient, useQuery } from "@apollo/client";
import Home from './src/components/home';
import { QUERY_FOR_TWEETS, QUERY_FOR_USERS } from './src/services/query-schemas';

const client = new ApolloClient({
  uri: "http://192.168.43.188:4000/graphql",
  cache: new InMemoryCache()
})

SplashScreen.preventAutoHideAsync();

export default function App() {

  const [fontsLoaded, setFontsLoaded] = useState(false);

  (async () => {
    try {
      await loadAsync({
        'DMSans-Regular': require('./assets/fonts/DMSans-Regular.ttf'),
        'DMSans-Bold': require('./assets/fonts/DMSans-Bold.ttf')
      });
  
      await SplashScreen.hideAsync();
  
      setFontsLoaded(true);
    } catch (error) {
      console.log("Font's failed to load");
    }
  })();

  useEffect(() => {
    return () => {
      client.stop();
    }
  }, []);

  // Fetch tweets
  const { loading:tweetLoading, error:tweetError, data:tweets } = useQuery(QUERY_FOR_TWEETS, {
    fetchPolicy: 'cache-and-network',
    client
  });

  if (tweetError) {
    showToast({ msg: "Failed to fetch tweets", danger: true });
    return;
  }

  // Fetch users
  const { loading:userLoading, error:usersError, data:users } = useQuery(QUERY_FOR_USERS, {
    fetchPolicy: 'cache-and-network',
    client
  })

  if (usersError) {
    showToast({ msg: "Failed to fetch users", danger: true });
    return;
  }

  if (fontsLoaded === false) {
    return null;
  }

  if (tweetLoading || userLoading) {
    return (
      <Loading />
    );
  }

  // TODO: do something else
  if (tweets.length == 0) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <RootSiblingParent>
        <SafeAreaView style={styles.safeArea}>
          <Home initialTweets={tweets.tweets} users={users.people} />
        </SafeAreaView>
      </RootSiblingParent>
    </ApolloProvider>
  );
  
}

const styles = StyleSheet.create({
  fontFam: {
    fontFamily: "DMSans-Regular"
  },
  safeArea: {
    paddingTop: Platform.OS === 'android' ? rnStatusBar.currentHeight : 0,
    flex: 1
  }
});
