import nextConnect from "next-connect";
import middleware from "../../middleware/database";
import { getSession } from "next-auth/client";
import { ObjectID } from "bson";
var url = require("url");

const handler = nextConnect();
handler.use(middleware);

var SpotifyWebApi = require("spotify-web-api-node");

handler.post(async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    let doc = "Not Signed In!";
    res.status(403).json(doc);
  } else {
    var spotifyApi = new SpotifyWebApi();

    const user = await req.db.collection("users").findOne(ObjectID(session.id));

    const playlist = await req.db
      .collection("playlists")
      .findOne(ObjectID(req.body.playlist_id));

    const workout = await req.db
      .collection("workout_types")
      .findOne(ObjectID(playlist.workout_id));

    spotifyApi.setCredentials({
      accessToken: user.spotify_tokens.access_token,
      refreshToken: user.spotify_tokens.refresh_token,
      redirectUri: process.env.NEXTAUTH_URL + "/api/auth/spotify",
      clientId: process.env.SPOTIFY_ID,
      clientSecret: process.env.SPOTIFY_SECRET,
    });

    let access_token = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(access_token.body["access_token"]);

    let spotify_playlist = null;

    if (!playlist.spotify_playlist) {
      // There isn't a playlist, so need to create one
      spotify_playlist = await spotifyApi.createPlaylist(
        req.body.name ? req.body.name : "Osti: " + workout.name + " Playlist",
        {
          description: "Created using Osti!",
          public: true,
        }
      );

      await req.db.collection("playlists").updateOne(
        { _id: ObjectID(req.body.playlist_id) },
        {
          $set: {
            spotify_playlist: {
              id: spotify_playlist.body.id,
              url: spotify_playlist.body.external_urls.spotify,
              name: spotify_playlist.body.name,
            },
          },
        }
      );

      playlist.spotify_playlist = {
        id: spotify_playlist.body.id,
        url: spotify_playlist.body.external_urls.spotify,
        name: spotify_playlist.body.name,
      };
    }

    // Clear the playlist if it already has songs in it
    // Also get the name of the playlist and update it in our db in case they change it
    spotify_playlist = await spotifyApi.getPlaylist(
      playlist.spotify_playlist.id
    );

    if (spotify_playlist.body.name != playlist.spotify_playlist.name) {
      await req.db.collection("playlists").updateOne(
        { _id: ObjectID(req.body.playlist_id) },
        {
          $set: {
            "spotify_playlist.name": spotify_playlist.body.name,
          },
        }
      );
    }

    if (spotify_playlist.body.tracks.total > 0) {
      let tracksToRemove = [];

      for (let i = 0; i < spotify_playlist.body.tracks.total; i++) {
        tracksToRemove.push(i);
      }

      await spotifyApi.removeTracksFromPlaylistByPosition(
        spotify_playlist.body.id,
        tracksToRemove,
        spotify_playlist.body.snapshot_id
      );
    }

    // Get the spotify uris from the database

    let track_ids = [];

    for (const track of playlist.tracks) {
      track_ids.push(ObjectID(track));
    }

    let spotify_uris = await req.db
      .collection("tracks")
      .find({ _id: { $in: track_ids } })
      .project({ "spotify.uri": 1 })
      .toArray();

    let uri_map = {};

    for (const uri of spotify_uris) {
      uri_map[uri._id.toString()] = uri.spotify.uri;
    }

    // Add tracks to the playlist
    let uris = [];

    for (const track of playlist.tracks) {
      uris.push(uri_map[track]);
    }

    await spotifyApi.addTracksToPlaylist(playlist.spotify_playlist.id, uris);

    res.status(200).json({
      id: spotify_playlist.body.id,
      url: spotify_playlist.body.external_urls.spotify,
      name: spotify_playlist.body.name,
    });
  }
});
export default handler;
