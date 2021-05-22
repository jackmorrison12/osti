import React, { useState } from "react";
import { getSession } from "next-auth/client";
import { connectToDatabase } from "../../middleware/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";

export default function Playlist({
  user,
  status,
  user_id,
  pid,
  playlist,
  workout,
  has_spotify,
}) {
  if (!playlist) {
    return (
      <>
        <Head>
          <title>Unknown Playlist</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <p>This not a valid playlist</p>
      </>
    );
  } else {
    const [spotifyPlaylist, setSpotifyPlaylist] = useState(
      playlist.spotify_playlist ? playlist.spotify_playlist : null
    );

    function millisToMinutesAndSeconds(millis) {
      var minutes = Math.floor(millis / 60000);
      var seconds = ((millis % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }
    async function savePlaylist(event) {
      let res = await fetch("/api/savePlaylist", {
        method: "POST",
        body: JSON.stringify({
          playlist_id: playlist._id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      res = await res.json();
      setSpotifyPlaylist(res);
    }

    return (
      <>
        <Head>
          <title>{workout.name} Playlist</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="container mx-auto text-center">
          <h1 className="text-4xl xl:text-6xl m-6 xl:m-12">
            Your {workout.name} Playlist
          </h1>
          {has_spotify ? (
            <>
              {spotifyPlaylist ? (
                <>
                  <h2 className="mb-5">
                    This playlist is currently saved to Spotify as:
                  </h2>
                  <a href={spotifyPlaylist.url}>
                    <button className="hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded mb-10">
                      {spotifyPlaylist.name}
                    </button>
                  </a>
                </>
              ) : (
                <button
                  onClick={savePlaylist}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded mb-10"
                >
                  Save Playlist to Spotify
                </button>
              )}
            </>
          ) : (
            ""
          )}
          <table className="table-fixed w-full text-left">
            <thead>
              <tr>
                <th className="w-1/12"></th>
                <th className="w-1/12 text-center">Pos</th>
                <th className="w-3/12">Track</th>
                <th className="w-3/12">Artist</th>
                <th className="w-2/12 text-center">Duration</th>
                <th className="w-2/12 text-center">BPM</th>
              </tr>
            </thead>
            <tbody>
              {playlist.tracks.map((track, i) => (
                <tr>
                  <td className="text-center">
                    <a href={track.data.lastfm_url}>
                      <img
                        className="inline xl:w-3/4"
                        src={track.data.image_url}
                      />
                    </a>
                  </td>
                  <td className="text-center">{i + 1}</td>
                  <td>{track.data.name}</td>
                  <td>{track.data.artist.name}</td>
                  <td className="text-center">
                    {millisToMinutesAndSeconds(track.data.features.duration)}
                  </td>
                  <td className="text-center">
                    {track.data.features.tempo.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  const { db } = await connectToDatabase();
  const pid = ctx.query.pid;

  if (!session) {
    ctx.res.writeHead(302, { Location: "/" });
    ctx.res.end();
    return {};
  }

  const user = await db.collection("users").findOne(ObjectId(session.id));

  const has_spotify = user.spotify_tokens;

  const playlist = await db
    .collection("playlists")
    .findOne({ _id: ObjectId(pid) });

  let workout = {};

  if (playlist) {
    playlist._id = playlist._id.toString();
    // Get workout object
    workout = await db
      .collection("workout_types")
      .findOne({ _id: ObjectId(playlist.workout_id) });

    workout._id = workout._id.toString();

    let track_ids = new Set();

    for (const track of playlist.tracks) {
      track_ids.add(ObjectId(track));
    }

    track_ids = [...track_ids];
    let song_data = await db
      .collection("tracks")
      .find({ _id: { $in: track_ids } })
      .toArray();

    let song_data_map = {};

    for (const data of song_data) {
      data._id = data._id.toString();
      song_data_map[data._id.toString()] = data;
    }

    let tracks = playlist.tracks;
    playlist.tracks = [];
    for (const track of tracks) {
      playlist.tracks.push({ id: track, data: song_data_map[track] });
    }
  }

  return {
    props: {
      user: session.user,
      status: user.status ? user.status : "none",
      user_id: session.id,
      pid: pid,
      playlist: playlist,
      workout: workout,
      has_spotify: has_spotify,
    },
  };
}
