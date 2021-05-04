import { getSession } from "next-auth/client";
import Link from "next/link";
import { connectToDatabase } from "../middleware/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";

export default function Recommendations({
  user,
  status,
  user_id,
  v1,
  v2,
  v3,
  v4,
}) {
  return (
    <>
      <Head>
        <title>Recommendations</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto text-center">
        <h1 className="text-6xl m-12">Recommendations</h1>

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
          ""
        )}

        {Object.keys(v1).map(function (key) {
          return (
            <div>
              Key: {key}, Value: {v1[key]}
            </div>
          );
        })}
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
  const recs = await db
    .collection("recommendations")
    .findOne({ user_id: session.id });

  // Iterate over these, and get the song data for each
  for (const workout in recs.v4) {
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
    },
  };
}
