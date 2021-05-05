import { useRouter } from "next/router";
import { getSession } from "next-auth/client";
import { connectToDatabase } from "../../middleware/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";

export default function Recommendation({
  user,
  status,
  user_id,
  v1,
  v2,
  v3,
  v4,
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
        <p>Recommendations for id: {workout.name}</p>
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

  if (workout) {
    workout._id = workout._id.toString();
    if (!recs.v4[workout.name]) {
      workout.no_recs = true;
    }
  }

  return {
    props: {
      user: session.user,
      status: user.status ? user.status : "none",
      user_id: session.id,
      v1: recs.v1,
      v2: recs.v2,
      v3: recs.v3,
      v4: recs.v4,
      wid: wid,
      workout: workout,
    },
  };
}
