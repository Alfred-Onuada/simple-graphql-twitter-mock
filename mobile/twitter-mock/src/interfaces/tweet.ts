import IPerson from "./person";

export default interface ITweet{
  _id: String,
  description: String,
  person: IPerson,
  likes: number,
}