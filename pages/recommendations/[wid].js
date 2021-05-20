import { useRouter } from "next/router";
import { getSession } from "next-auth/client";
import { connectToDatabase } from "../../middleware/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";
import RecList from "../../components/recommendations/rec_list";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
TimeAgo.addLocale(en);

export default function Recommendation({
  user,
  status,
  user_id,
  top_songs,
  top_recs,
  wid,
  workout,
  playlists,
  default_stats,
  custom_stats,
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
    const timeAgo = new TimeAgo("en-GB");
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
          <div className="pb-10">
            {custom_stats ? (
              <>
                <h1 className="pb-5">
                  Here are your custom {workout.name} stats:
                </h1>{" "}
                <table className="table-fixed w-full">
                  <thead>
                    <tr>
                      <th className="w-2/12">Average Length</th>
                      <th className="w-2/12">Average Calories</th>
                      <th className="w-2/12">Average Heart Rate</th>
                      <th className="w-2/12">Average Distance</th>
                      <th className="w-2/12">Average Speed</th>
                      <th className="w-2/12">Average Steps</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {custom_stats.stats.average_length
                          ? custom_stats.stats.average_length.toFixed(0) +
                            " minutes"
                          : ""}
                      </td>
                      <td>
                        {custom_stats.stats.average_calories
                          ? custom_stats.stats.average_calories.toFixed(0) +
                            " kcal"
                          : ""}
                      </td>
                      <td>
                        {custom_stats.stats.average_heart_rate
                          ? custom_stats.stats.average_heart_rate.toFixed(0) +
                            " bpm"
                          : ""}
                      </td>
                      <td>
                        {custom_stats.stats.average_distance
                          ? (
                              custom_stats.stats.average_distance / 1000
                            ).toFixed(2) + " km"
                          : "n/a"}
                      </td>
                      <td>
                        {custom_stats.stats.average_speed
                          ? custom_stats.stats.average_speed.toFixed(2) + " m/s"
                          : "n/a"}
                      </td>
                      <td>
                        {custom_stats.stats.average_steps
                          ? custom_stats.stats.average_steps.toFixed(0) +
                            " steps"
                          : "n/a"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <h1 className="pb-5">
                  Here are your default {workout.name} stats:
                </h1>
                <table className="table-fixed w-full">
                  <thead>
                    <tr>
                      <th className="w-2/12">Average Length</th>
                      <th className="w-2/12">Average Calories</th>
                      <th className="w-2/12">Average Heart Rate</th>
                      <th className="w-2/12">Average Distance</th>
                      <th className="w-2/12">Average Speed</th>
                      <th className="w-2/12">Average Steps</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {default_stats.stats.average_length
                          ? default_stats.stats.average_length.toFixed(0) +
                            " minutes"
                          : ""}
                      </td>
                      <td>
                        {default_stats.stats.average_calories
                          ? default_stats.stats.average_calories.toFixed(0) +
                            " kcal"
                          : ""}
                      </td>
                      <td>
                        {default_stats.stats.average_heart_rate
                          ? default_stats.stats.average_heart_rate.toFixed(0) +
                            " bpm"
                          : ""}
                      </td>
                      <td>
                        {default_stats.stats.average_distance
                          ? (
                              default_stats.stats.average_distance / 1000
                            ).toFixed(2) + " km"
                          : "n/a"}
                      </td>
                      <td>
                        {default_stats.stats.average_speed
                          ? default_stats.stats.average_speed.toFixed(2) +
                            " m/s"
                          : "n/a"}
                      </td>
                      <td>
                        {default_stats.stats.average_steps
                          ? default_stats.stats.average_steps.toFixed(0) +
                            " steps"
                          : "n/a"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>
          <div className="pb-10">
            {playlists.length > 0 ? (
              <>
                <p className="pb-5">
                  You have {playlists.length} playlist
                  {playlists.length > 1 ? "s" : ""} available:
                </p>
                <table className="table-fixed w-full">
                  <thead>
                    <tr>
                      <th className="w-1/12">Playlist</th>
                      <th className="w-2/12">Length</th>
                      <th className="w-2/12">Created</th>
                      <th className="w-5/12">Preview</th>
                      <th className="w-2/12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {playlists.map((playlist, i) => (
                      <tr>
                        <td>{i + 1}</td>
                        <td>
                          {playlist["length"].toFixed(0)} minutes,{" "}
                          {playlist.tracks.length} songs
                        </td>
                        <td>{timeAgo.format(playlist.created_at * 1000)}</td>
                        <td>
                          {playlist.tracks[0].data.name},{" "}
                          {playlist.tracks[1].data.name},{" "}
                          {playlist.tracks[2].data.name}...
                        </td>
                        <td>
                          <a href={"/playlists/" + playlist._id}>
                            <button className="hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded">
                              View/Download Playlist
                            </button>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              "no playlists"
            )}
          </div>
          <div className="grid grid-cols-2">
            <div className="col-span-2 xl:col-span-1">
              <RecList title="Top Recommendations" recs={top_recs} wid={wid} />
            </div>
            <div className="col-span-2 xl:col-span-1">
              <RecList
                title={"Most Listened to " + workout.name + " Songs"}
                recs={top_songs}
                counts={true}
                wid={wid}
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
  let playlists = [];
  let stats = [];
  let default_stats = null;
  let custom_stats = null;

  if (workout) {
    workout._id = workout._id.toString();

    if (!recs.v5[workout.name]) {
      workout.no_recs = true;
    } else {
      let top_songs = recs.v1[workout.name];
      let top_recs = recs.v5[workout.name];

      let track_ids = new Set();

      for (const song of top_songs) {
        track_ids.add(ObjectId(song.track_id));
      }

      for (const song of top_recs) {
        track_ids.add(ObjectId(song.track_id));
      }

      track_ids = [...track_ids];

      let song_data = await db
        .collection("tracks")
        .find({ _id: { $in: track_ids } })
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
        if (boost.track_id in song_data_map) {
          song_data_map[boost.track_id].boost = boost.value;
        }
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

      playlists = await db
        .collection("playlists")
        .find({ user_id: session.id, workout_id: workout._id })
        .sort({ created_at: -1 })
        .toArray();
      track_ids = new Set();
      for (const playlist of playlists) {
        playlist._id = playlist._id.toString();
        for (const track of playlist.tracks) {
          track_ids.add(ObjectId(track));
        }
      }

      track_ids = [...track_ids];
      song_data = await db
        .collection("tracks")
        .find({ _id: { $in: track_ids } })
        .toArray();

      song_data_map = {};

      for (const data of song_data) {
        data._id = data._id.toString();
        song_data_map[data._id.toString()] = data;
      }

      for (const playlist of playlists) {
        let tracks = playlist.tracks;
        playlist.tracks = [];
        for (const track of tracks) {
          playlist.tracks.push({ id: track, data: song_data_map[track] });
        }
      }

      // Get the user stats
      stats = await db
        .collection("user_workout_stats")
        .find({ user_id: session.id, workout_id: workout._id })
        .sort({ default: -1 })
        .toArray();
      console.log(stats);

      for (const stat of stats) {
        stat._id = stat._id.toString();
      }
      if (stats.length == 1) {
        default_stats = stats[0];
      } else {
        default_stats = stats[0];
        custom_stats = stats[1];
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
      playlists: playlists,
      default_stats: default_stats,
      custom_stats: custom_stats,
    },
  };
}
