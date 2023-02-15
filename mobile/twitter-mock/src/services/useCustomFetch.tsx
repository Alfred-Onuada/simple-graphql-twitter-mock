const API_URL = "http://192.168.43.188:4000/graphql";

export default async function UseCustomFetch(query: String, variables?: Object, abortSignal?: AbortSignal, operationName?: string) {
  
  console.log(JSON.stringify({
    query: query,
    variables: variables,
    operationName
  }));
  
  try {
    const res = await fetch(API_URL, {
      signal: abortSignal,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
        operationName
      }),
      cache: "default"
    })
  
    return res.json();
  } catch (error) {
    // returning it as errors because graphql also returns it'w own errors as errors
    return new Promise((resolve) => resolve({ errors: error }))
  }
}