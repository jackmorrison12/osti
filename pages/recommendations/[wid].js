import { useRouter } from "next/router";
import { getSession } from "next-auth/client";
import { connectToDatabase } from "../../middleware/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";
import RecList from "../../components/recommendations/rec_list";

export default function Recommendation({
  user,
  status,
  user_id,
  top_songs,
  top_recs,
  wid,
  workout,
}) {
  if (!workout) {
    return (
      <>
        <Head>
          <title>Unknown Workout Type</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <p>This not a valid workout type</p>
      </>
    );
  } else if (workout.no_recs) {
    return (
      <>
        <Head>
          <title>{workout.name} Recommendations</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <p>Do a {workout.name} workout to get recommendations!</p>
      </>
    );
  } else {
    return (
      <>
        <Head>
          <title>{workout.name} Recommendations</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="container mx-auto text-center">
          <h1 className="text-4xl xl:text-6xl m-6 xl:m-12">
            Your {workout.name} Recommendations
          </h1>
          <div className="grid grid-cols-2">
            <div className="col-span-2 xl:col-span-1">
              <RecList title="Top Recommendations" recs={top_recs} />
            </div>
            <div className="col-span-2 xl:col-span-1">
              <RecList
                title={"Most Listened to " + workout.name + " Songs"}
                recs={top_songs}
                counts={true}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  const { db } = await connectToDatabase();
  const wid = ctx.query.wid;

  if (!session) {
    ctx.res.writeHead(302, { Location: "/" });
    ctx.res.end();
    return {};
  }

  const user = await db.collection("users").findOne(ObjectId(session.id));
  const recs = await db
    .collection("recommendations")
    .findOne({ user_id: session.id });

  let workout = await db.collection("workout_types").findOne(ObjectId(wid));

  let top_songs_data = [];
  let top_recs_data = [];

  if (workout) {
    workout._id = workout._id.toString();

    if (!recs.v4[workout.name]) {
      workout.no_recs = true;
    } else {
      let top_songs = recs.v1[workout.name];
      let top_recs = recs.v4[workout.name];

      let song_ids = new Set();

      for (const song of top_songs) {
        song_ids.add(ObjectId(song.track_id));
      }

      for (const song of top_recs) {
        song_ids.add(ObjectId(song.track_id));
      }

      song_ids = [...song_ids];

      let song_data = await db
        .collection("tracks")
        .find({ _id: { $in: song_ids } })
        .toArray();

      let song_data_map = {};

      for (const data of song_data) {
        song_data_map[data._id.toString()] = data;
        song_data_map[data._id.toString()].boost = 0;
      }

      let boosts = await db
        .collection("boosts")
        .find({ user_id: session.id, workout_id: workout._id })
        .toArray();

      for (const boost of boosts) {
        song_data_map[boost.track_id].boost = boost.value;
      }

      for (const song of top_recs) {
        let data = Object.assign({}, song_data_map[song.track_id]);
        data._id = data._id.toString();
        top_recs_data.push(data);
      }

      for (const song of top_songs) {
        let data = Object.assign({}, song_data_map[song.track_id]);
        data._id = data._id.toString();
        data.count = song.score;
        top_songs_data.push(data);
      }
    }
  }

  return {
    props: {
      user: session.user,
      status: user.status ? user.status : "none",
      user_id: session.id,
      top_songs: top_songs_data,
      top_recs: top_recs_data,
      wid: wid,
      workout: workout,
    },
  };
}
