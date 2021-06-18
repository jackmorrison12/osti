import { getSession } from "next-auth/client";
import Link from "next/link";
import { connectToDatabase } from "../middleware/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";

export default function Recommendations({ user, status, workout_types }) {
  return (
    <>
      <Head>
        <title>Recommendations</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto text-center">
        <h1 className="text-4xl xl:text-6xl m-12">Recommendations</h1>

        {status != "fetched" ? (
          <>
            <p className="m-6 text-xl">
              Hey {user.name}, you need to connect your accounts to get
              recommendations!
            </p>
            <p className="m-2 text-l">
              Go to{" "}
              <Link href="/profile">
                <a className="text-blue-500 hover:underline">your profile</a>
              </Link>{" "}
              to link your LastFM and Google Fit accounts
            </p>
          </>
        ) : (
          <>
            {workout_types ? (
              <>
                <p>
                  We've currently got recommendations for the following workout
                  types:
                </p>
                <br />{" "}
                {workout_types.map(function (workout) {
                  return (
                    <p>
                      <a href={"/recommendations/" + workout._id}>
                        {workout.name}
                      </a>
                    </p>
                  );
                })}
              </>
            ) : (
              <p>
                We've currently not got any recommendations for you yet! <br />
                Complete your first workout with music to get recommendations
              </p>
            )}
          </>
        )}
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

  var user = await db.collection("users").findOne(ObjectId(session.id));
  var recs = await db
    .collection("recommendations")
    .findOne({ user_id: session.id }, { v4: 1 });

  // For demo, show some results
  if (
    !user.status &&
    Date.now() > 1624345200000 &&
    Date.now() < 1624363200000
  ) {
    user = await db
      .collection("users")
      .findOne(ObjectId("606c78c40326f734f14f326b"));
    recs = await db
      .collection("recommendations")
      .findOne({ user_id: "606c78c40326f734f14f326b" }, { v4: 1 });
  }

  let workout_types = null;
  if (recs) {
    workout_types = await db
      .collection("workout_types")
      .find({ name: { $in: Object.keys(recs.v4) } })
      .toArray();

    for (const workout of workout_types) {
      workout._id = workout._id.toString();
    }
    workout_types.sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    props: {
      user: session.user,
      status: user.status ? user.status : "none",
      workout_types: workout_types,
    },
  };
}
