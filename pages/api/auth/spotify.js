import { connectToDatabase } from "../../../middleware/mongodb";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/client";
import { data } from "autoprefixer";
var SpotifyWebApi = require("spotify-web-api-node");

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const global_session = await getSession({ req });
  var credentials = {
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    redirectUri: process.env.NEXTAUTH_URL + "/api/auth/spotify",
  };

  var spotifyApi = new SpotifyWebApi(credentials);

  // The code that's returned as a query parameter to the redirect URI
  var code = req.query.code;

  // Retrieve an access token and a refresh token
  let data = await spotifyApi.authorizationCodeGrant(code);

  // Set the access token on the API object to use it in later calls
  spotifyApi.setAccessToken(data.body["access_token"]);
  spotifyApi.setRefreshToken(data.body["refresh_token"]);

  // Store spotify token object
  await db.collection("users").updateOne(
    { _id: ObjectId(global_session.id) },
    {
      $set: {
        spotify_tokens: data.body,
      },
    },
    { upsert: true }
  );

  res.redirect("/profile");
}
