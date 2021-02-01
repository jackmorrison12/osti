import { getSession } from "next-auth/client";
import Link from "next/link";
import { connectToDatabase } from "../middleware/mongodb";
import { ObjectId } from "mongodb";

export default function Profile({ user, lastfm }) {
  return (
    <div className="container mx-auto text-center">
      <h1 className="text-6xl m-12">Profile Page</h1>
      <img className="inline" src={user.image} />
      <p className="m-6 text-xl">
        Welcome {user.name} - this page can only be seen by a logged in user!
      </p>
      {lastfm ? (
        <p>You're lastfm account is connected as {lastfm}</p>
      ) : (
          <a href={"http://www.last.fm/api/auth/?api_key=" + process.env.LASTFM_KEY + "&cb=" + process.env.NEXTAUTH_URL + "/api/auth/lastfm"}>Connect to lastfm</a>
      )}

      <p className="m-2 text-l">
        Return to{" "}
        <Link href="/">
          <a className="text-blue-500 hover:underline">home</a>
        </Link>
      </p>
    </div>
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

  return {
    props: {
      user: session.user,
      lastfm: user.lastfm_username ? user.lastfm_username : null,
    },
  };
}
