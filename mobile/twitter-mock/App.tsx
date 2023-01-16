import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar as rnStatusBar, Platform, FlatList, TouchableOpacity, Modal, TextInput, Pressable } from 'react-native';
import { loadAsync } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { QUERY_FOR_TWEETS, QUERY_FOR_USERS, SAVE_TWEET } from './src/services/query-schemas';
import Loading from './src/components/loading';
import TweetCard from './src/components/tweet-card';
import UseCustomFetch from './src/services/useCustomFetch';
import ITweet from './src/interfaces/tweet';
import { RootSiblingParent } from 'react-native-root-siblings';
import showToast from './src/services/toast';
import { Picker } from "@react-native-picker/picker";
import IPerson from './src/interfaces/person';

SplashScreen.preventAutoHideAsync();

export default function App() {
  
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tweetModalOpenStatus, setTweetModalOpenStatus] = useState(false);
  const [listOfUsers, setListOfUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [tweetDescription, setTweetDescription] = useState('');

  const deleteTweetInList = function (id: String) {
    setTweets(prevTweets => {
      let tweets = prevTweets.filter((tweet: ITweet) => tweet._id !== id) 

      return tweets;
    })
  };

  const addTweet = function () {
    setTweetModalOpenStatus(true)
  };

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

  // Fetch tweets
  (async () => {
    // for some reason react tends to re run this over and over again, migh tbe ficable ia usecallback though
    if (tweets.length) {
      
    }

    const response = await UseCustomFetch(QUERY_FOR_TWEETS);
    setLoading(false);
    
    if (response.error) {
      showToast({ msg: "Failed to fetch tweets", danger: true });
      return;
    }
    
    setTweets(response.data.tweets);
  })();

  const saveTweet = async () => {
    if (tweetDescription.length > 0 && selectedUser.length > 0) {
      const newTweet = { description: tweetDescription, person: selectedUser };

      const response = await UseCustomFetch(SAVE_TWEET, newTweet);

      console.log(response);
    }
  };

  // Fetch users
  (async () => {
    // for some reason react tends to re run this over and over again, migh tbe ficable ia usecallback though
    if (listOfUsers.length) {
      return
    }

    const response = await UseCustomFetch(QUERY_FOR_USERS);
    
    if (response.error) {
      showToast({ msg: "Failed to fetch tweets", danger: true });
      return;
    }

    setListOfUsers(response.data.people);
  })();

  if (fontsLoaded === false) {
    return null;
  }

  if (loading) {
    return (
      <Loading />
    );
  }

  if (tweets.length == 0) {
    return null;
  }

  return (
    <RootSiblingParent>
      <SafeAreaView style={styles.safeArea}>

        <Modal
          animationType='slide'
          visible={tweetModalOpenStatus}
          transparent={true}
          >      
            <View style={styles.modalDim}>
              <View style={styles.modalContent}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 20, marginBottom: 20 }}>Create a new tweet</Text>
                  <Pressable onPress={() => setTweetModalOpenStatus(false)}>
                    <MaterialIcons name='close' size={24} color='black' />
                  </Pressable>
                </View>

                <Text style={{ ...styles.fontFam, ...styles.label }}>Choose a user:</Text>
                <Picker selectedValue={selectedUser}
                  onValueChange={(itemValue, itemIndex) => {
                    setSelectedUser(itemValue)
                  }}>
                    {
                      listOfUsers.map((user: IPerson) => (
                        <Picker.Item label={user.name} value={user._id} key={user._id.toString()} />
                      ))
                    }
                </Picker>
                
                <Text style={{ ...styles.fontFam, ...styles.label }}>Type a tweet:</Text>
                <TextInput 
                  multiline
                  value={tweetDescription}
                  onChangeText={(value) => {
                    setTweetDescription(value)
                  }} 
                  style={styles.input}
                  placeholder="What's on your mind?" />

                <TouchableOpacity style={styles.btn}
                  onPress={() => {}}>
                  <Text style={styles.btnText}>Add Tweet</Text>
                  <FontAwesome name="send" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>  
        </Modal>

        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Twitter</Text>
          </View>
  
          <FlatList
            data={tweets}
            renderItem={({ item }) => (
              <TweetCard 
                details={item}
                deleteTweetInList={deleteTweetInList} />
            )} 
            />

          {/* opens the add tweet modal */}
          <TouchableOpacity style={styles.addTweetIcon}
            onPress={addTweet}>
            <MaterialIcons name="post-add" size={32} color="white" />
          </TouchableOpacity>
          <StatusBar style="dark" />
        </View>
      </SafeAreaView>
    </RootSiblingParent>
  );
  
}

const styles = StyleSheet.create({
  fontFam: {
    fontFamily: "DMSans-Regular"
  },
  safeArea: {
    paddingTop: Platform.OS === 'android' ? rnStatusBar.currentHeight : 0,
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: "rgb(29, 155, 240)",
    height: 50,
    justifyContent: 'center'
  },
  headerTitle: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontFamily: 'DMSans-Regular'
  },
  addTweetIcon: {
    backgroundColor: "rgb(29, 155, 240)",
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 25,
    height: 70,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    borderRadius: 100
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 25,
    padding: 20,
    elevation: 20
  },
  input: {
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 15
  },
  modalDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  label: { 
    fontSize: 16, 
    marginBottom: 10
  },
  btnText: { 
    fontFamily: 'DMSans-Regular', 
    fontSize: 18, 
    color: 'white',
    marginRight: 10
  },
  btn: {
    display: 'flex',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    backgroundColor: "rgb(29, 155, 240)",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 25,
    alignItems: 'center'
  }
});
