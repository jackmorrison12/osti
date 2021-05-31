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

  let state = await spotifyApi.getMyCurrentPlaybackState();

  if (state.body.is_playing) {
    const track = await req.db.collection("tracks").findOne({
      name: state.body.item.name,
      "artist.name": state.body.item.artists[0].name,
    });
    if (track) {
      res.status(200).json({ track_id: track._id.toString() });
    } else {
      res.status(200).json({ track_id: null });
    }
  } else {
    res.status(200).json({ track_id: null });
  }
});
export default handler;
