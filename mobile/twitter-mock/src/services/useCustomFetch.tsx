const API_URL = "http://192.168.43.178:4000/graphql";

export default async function UseCustomFetch(query: String, variables?: Object) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query: query,
        variables
      }),
      cache: "default"
    })
  
    return res.json();
  } catch (error) {
    return new Promise((resolve) => resolve({ error }))
  }
}