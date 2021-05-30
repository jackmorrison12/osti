import nextConnect from "next-connect";
import middleware from "../../../middleware/database";
import { getSession } from "next-auth/client";
import { ObjectID } from "bson";
var url = require("url");

const handler = nextConnect();
handler.use(middleware);

var SpotifyWebApi = require("spotify-web-api-node");

handler.post(async (req, res) => {
  const session = await getSession({ req });

  var spotifyApi = new SpotifyWebApi();

  const user = await req.db.collection("users").findOne(ObjectID(req.body.uid));

  spotifyApi.setCredentials({
    accessToken: user.spotify_tokens.access_token,
    refreshToken: user.spotify_tokens.refresh_token,
    redirectUri: process.env.NEXTAUTH_URL + "/api/auth/spotify",
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
  });

  let access_token = await spotifyApi.refreshAccessToken();

  spotifyApi.setAccessToken(access_token.body["access_token"]);

  let spotify_uri = await req.db
    .collection("tracks")
    .findOne({ _id: ObjectID(req.body.tid) });

  await spotifyApi.addToQueue(spotify_uri.spotify.uri);

  res.status(200).json({ success: true });
});
export default handler;
