import nextConnect from "next-connect";
import middleware from "../../middleware/database";
import { getSession } from "next-auth/client";
import { ObjectID } from "bson";
var url = require("url");

const handler = nextConnect();
handler.use(middleware);

var SpotifyWebApi = require("spotify-web-api-node");

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});

spotifyApi.clientCredentialsGrant().then(
  function (data) {
    console.log("Access Token Retrieved");

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body["access_token"]);
  },
  function (err) {
    console.log("Something went wrong when retrieving an access token", err);
  }
);

handler.post(async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    let doc = "Not Signed In!";
    res.status(403).json(doc);
  } else {
    let uri = new url.URL(req.body.uri).pathname.substring(7);

    let track = {};

    //   Get the data needed for that uri
    let track_data = {};
    try {
      track_data = await spotifyApi.getTrack(uri);
    } catch (e) {
      // Update the access token
      spotifyApi.clientCredentialsGrant().then(
        function (data) {
          console.log("Access Token Retrieved");
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body["access_token"]);
        },
        function (err) {
          console.log(
            "Something went wrong when retrieving an access token",
            err
          );
        }
      );
    }
    track.spotify = {};
    track.spotify.uri = track_data.body.uri;
    track.spotify.preview = track_data.body.preview_url;
    track.spotify.id = track_data.body.id;
    track.name = track_data.body.name;
    track.features = {};
    track.features.duration = track_data.body.duration_ms;
    track.album = {};
    track.album.id = track_data.body.album.id;
    track.album.name = track_data.body.album.name;
    track.release_date = track_data.body.album.release_date;
    track.artist = {};
    track.artist.name = track_data.body.artists[0].name;
    track.artist.id = track_data.body.artists[0].id;
    track.artists = [];
    for (const a of track_data.body.artists) {
      let artist = {};
      artist.name = a.name;
      artist.id = a.id;
      track.artists.push(artist);
    }
    let track_features = {};
    try {
      track_features = await spotifyApi.getAudioFeaturesForTrack(uri);
    } catch (e) {
      // Update the access token
      spotifyApi.clientCredentialsGrant().then(
        function (data) {
          console.log("Access Token Retrieved");
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body["access_token"]);
        },
        function (err) {
          console.log(
            "Something went wrong when retrieving an access token",
            err
          );
        }
      );
    }
    track.features.danceability = track_features.body.danceability;
    track.features.energy = track_features.body.energy;
    track.features.key = track_features.body.key;
    track.features.loudness = track_features.body.loudness;
    track.features.mode = track_features.body.mode;
    track.features.speechiness = track_features.body.speechiness;
    track.features.acousticness = track_features.body.acousticness;
    track.features.instrumentalness = track_features.body.instrumentalness;
    track.features.liveness = track_features.body.liveness;
    track.features.valence = track_features.body.valence;
    track.features.tempo = track_features.body.tempo;
    track.features.time_signature = track_features.body.time_signature;

    //   Add it to the track with req.body.track_id in the db
    let doc = await req.db.collection("tracks").updateOne(
      {
        _id: ObjectID(req.body.track_id),
      },
      {
        $set: {
          spotify: track.spotify,
          name: track.name,
          features: track.features,
          album: track.album,
          release_date: track.release_date,
          artist: track.artist,
          artists: track.artists,
        },
      }
    );
    res.status(200).json(doc);
  }
});
export default handler;
