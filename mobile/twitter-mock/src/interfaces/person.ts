import ITweet from "./tweet";

export default interface IPerson{
  _id: String,
  name: string,
  email: String,
  age?: number,
  bio?: String,
  lastFiveTweets?: ITweet[]
}