import './env.js'
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { json } from 'express';
import http from 'http';
import cors from 'cors';
import resolvers from "./resolvers.js";
import { readFileSync } from "fs";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';

const app = express();
const httpServer = http.createServer(app);

const schema = makeExecutableSchema({
  typeDefs: readFileSync('./schema.graphql').toString(),
  resolvers
});

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
})

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          }
        }
      }
    }
  ],
});
await server.start();
app.use(
  '/graphql', 
  cors(), 
  json(), 
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  })
)

const PORT = process.env.PORT || 4000;

await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
console.log(`🚀 App is live at http://localhost:${PORT}/graphql`);