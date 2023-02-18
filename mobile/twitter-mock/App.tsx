import { useEffect, useRef, useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar as rnStatusBar, Platform } from 'react-native';
import { loadAsync } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Loading from './src/components/loading';
import { RootSiblingParent } from 'react-native-root-siblings';
import showToast from './src/services/toast';
import { ApolloProvider, InMemoryCache, ApolloClient, useQuery } from "@apollo/client";
import Home from './src/components/home';
import { QUERY_FOR_TWEETS, QUERY_FOR_USERS } from './src/services/query-schemas';
import { HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const httpLink = new HttpLink({
  uri: 'http://192.168.43.188:4000/graphql'
})

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://192.168.43.188:4000/graphql'
}))

const splitFunc = split(
  ({ query }) => {
    const definition  = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  }, 
  wsLink, // true
  httpLink // false
)

const client = new ApolloClient({
  link: splitFunc,
  cache: new InMemoryCache()
})

// Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function sendPushNotification(expoPushToken: string, { title, body, data }:{ title: string, body: string, data?: Object }) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

SplashScreen.preventAutoHideAsync();

export default function App() {

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

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
    registerForPushNotificationsAsync().then((token: string | undefined) => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      client.stop();
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
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
          <Home initialTweets={tweets.tweets} users={users.people} expoPushToken={expoPushToken}
            sendNotification={sendPushNotification} canSendNotification={typeof expoPushToken !== 'undefined'} />
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
