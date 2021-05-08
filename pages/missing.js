import { getSession } from "next-auth/client";
import Link from "next/link";
import { connectToDatabase } from "../middleware/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";
import MissingList from "../components/missing/missing_list";

export default function Missing({ user, status, unknown_tracks }) {
  return (
    <>
      <Head>
        <title>Missing Songs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto text-center">
        <h1 className="text-4xl xl:text-6xl m-12">Missing Songs</h1>
        <h2 className="text-xl m-12">
          Here are some songs you've listened to which we haven't been able to
          find on Spotify <br /> Just paste in the Spotify URI to add them to
          our system!
        </h2>
        <MissingList title="Missing Songs" unknown_tracks={unknown_tracks} />
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  const { db } = await connectToDatabase();

  if (!session) {
    ctx.res.writeHead(302, { Location: "/" });
    ctx.res.end();
    return {};
  }

  const user = await db.collection("users").findOne(ObjectId(session.id));

  const tracks = await db
    .collection("tracks")
    .find({ spotify: null })
    .toArray();

  let track_id_map = {};
  let track_ids = [];

  for (const track of tracks) {
    track_id_map[track._id] = track;
    track_ids.push(track._id);
  }
  //   console.log(tracks);

  //   const user_tracks = await db
  //     .collection("listens")
  //     .find({ user_id: session.id, song_id: { $in: track_ids } })
  //     .toArray();

  let user_tracks = await db
    .collection("listens")
    .aggregate([
      {
        $match: {
          user_id: session.id,
          song_id: { $in: track_ids },
        },
      },
      {
        $group: {
          _id: "$song_id",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])
    .toArray();

  user_tracks = user_tracks.slice(0, 100);

  for (const track of user_tracks) {
    track._id = track._id.toString();
  }

  for (let track of user_tracks) {
    track.name = track_id_map[track._id].name;
    track.artist = track_id_map[track._id].artist;
    track.album = track_id_map[track._id].album;
    track.image_url = track_id_map[track._id].image_url;
    track.lastfm_url = track_id_map[track._id].lastfm_url;
  }

  return {
    props: {
      user: session.user,
      status: user.status ? user.status : "none",
      unknown_tracks: user_tracks,
    },
  };
}
