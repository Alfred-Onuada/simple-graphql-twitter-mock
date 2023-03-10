import { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, TextInput, Pressable } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { QUERY_FOR_PERSON, SAVE_TWEET } from './../services/query-schemas';
import showToast from './../services/toast';
import { Picker } from "@react-native-picker/picker";
import IPerson from './../interfaces/person';
import UseCustomFetch from './../services/useCustomFetch';
import ITweet from "../interfaces/tweet";
import Tweets from "./tweets";

export default function Home({ initialTweets, users, expoPushToken, sendNotification, canSendNotification }: { initialTweets: ITweet[], users: IPerson[], expoPushToken: string | undefined, sendNotification: (expoPushToken: string, payload: { title: string, body: string, data?: Object }) => void, canSendNotification: boolean }) {
  
  const [profileModalOpenStatus, setProfileModalOpenStatus] = useState(false);
  const [profileDetails, setProfileDetails] = useState<IPerson>();
  const [tweetModalOpenStatus, setTweetModalOpenStatus] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [tweetDescription, setTweetDescription] = useState('');

  // TODO: maybe later on figure out how to subscribe to a specific user, 
  // currently I can't figure out how to subscribe on button click as
  // hooks can not be called from within functions

  const openProfile = async function (id: String) {
    const response = await UseCustomFetch(QUERY_FOR_PERSON, { id });

    if (response.errors) {
      showToast({ msg: "Something went wrong fetching profile info", danger: true });
      return;
    }

    setProfileDetails(response.data.getPerson);

    setProfileModalOpenStatus(true);
  }

  const addTweet = function () {
    setTweetModalOpenStatus(true)
  };

  const saveTweet = async () => {
    // basically if they exist
    if (tweetDescription.length > 0 && selectedUser.length > 0) {
      const newTweet = { description: tweetDescription, person: selectedUser };

      const response = await UseCustomFetch(SAVE_TWEET, newTweet);

      if (response.errors) {
        showToast({ msg: "An error occured while adding tweet", danger: true });
        return;
      }

      // when a new tweet is added it will call the subscription so no need to add it manually
      if (canSendNotification && expoPushToken) {
        const payload = {
          title: 'New tweet added',
          body: tweetDescription
        }
        sendNotification(expoPushToken, payload)
      }

      // reset the form values
      setSelectedUser('');
      setTweetDescription('');

      // close the tweet modal
      setTweetModalOpenStatus(false);
    }
  };

  return (
    <View style={styles.fullHeight}>
      {/* Add tweet modal */}
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
                users.map((user: IPerson) => (
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
              onPress={saveTweet}>
              <Text style={styles.btnText}>Add Tweet</Text>
              <FontAwesome name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* User profile modal */}
      <Modal
        visible={profileModalOpenStatus}
        transparent={true}
        animationType='slide'>
        <View style={styles.modalDim}>
          <View style={styles.modalContent}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 20, marginBottom: 20 }}>Profile</Text>
              <Pressable onPress={() => setProfileModalOpenStatus(false)}>
                <MaterialIcons name='close' size={24} color='black' />
              </Pressable>
            </View>

            {
              profileDetails &&
              <View>
                <View>
                  <Text style={styles.profileInfo}><Text style={styles.profileInfoTitle}>Name:</Text> {profileDetails.name}</Text>
                  <Text style={styles.profileInfo}><Text style={styles.profileInfoTitle}>Email:</Text> {profileDetails.email}</Text>
                  <Text style={styles.profileInfo}><Text style={styles.profileInfoTitle}>Bio:</Text> {profileDetails.bio}</Text>
                  <Text style={styles.profileInfo}><Text style={styles.profileInfoTitle}>Year of birth:</Text> {profileDetails.age ? new Date().getFullYear() - profileDetails.age : ''}</Text>
                </View>

                {/* { 
                  canSendNotification ?
                    <TouchableOpacity style={styles.subBtn}
                      onPress={() => subscribeAction(profileDetails._id)}>
                      <Text style={styles.subText}>{subcribedMap.get(profileDetails._id) ? 'Subscribed' : 'Subscribe'}</Text>
                    </TouchableOpacity>
                  : null
                } */}
                
              </View>
            }

          </View>
        </View>
      </Modal>


      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Twitter</Text>
        </View>

        <Tweets initialTweets={initialTweets}
          openProfile={openProfile}/>
        

        {/* opens the add tweet modal */}
        <TouchableOpacity style={styles.addTweetIcon}
          onPress={addTweet}>
          <MaterialIcons name="post-add" size={32} color="white" />
        </TouchableOpacity>
        <StatusBar style="dark" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullHeight: {
    flex: 1
  },
  fontFam: {
    fontFamily: "DMSans-Regular"
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
  },
  profileInfo: {
    fontFamily: 'DMSans-Regular',
    fontSize: 17,
    marginVertical: 10
  },
  profileInfoTitle: {
    fontWeight: 'bold'
  },
  subBtn: {
    backgroundColor: "rgb(29, 155, 240)",
    paddingVertical: 10,
    marginTop: 20
  },
  subText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontFamily: 'DMSans-Regular'
  }
});