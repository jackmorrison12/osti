import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/client";
import { getSession } from "next-auth/client";
import { connectToDatabase } from "../middleware/mongodb";
import { ObjectId } from "mongodb";

export default function Home({ user, status, user_id }) {
  const [session, loading] = useSession();

  return (
    <div>
      <Head>
        <title>Osti</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto text-center">
        <h1 className="text-6xl m-12">Osti</h1>
        <p className="text-xl">
          Automated Personalised Context-Aware Music Recommendation System
        </p>
      </div>

      <div className="container mx-auto text-center pt-5">
        {loading ? (
          <>loading...</>
        ) : (
          <>
            {!session && (
              <>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={() => signIn("google")}
                >
                  Sign in with Google
                </button>
              </>
            )}
            {session && (
              <>
                {status == "none" ? (
                  <p class="pb-10">
                    Hey, it looks like you're not set up yet! Head over to your{" "}
                    <Link href="/profile">
                      <a className="text-blue-500 hover:underline">profile</a>
                    </Link>{" "}
                    to get started!
                  </p>
                ) : (
                  ""
                )}

                <br class="p-5-b" />
                <p>
                  Signed in as{" "}
                  <Link href="/profile">
                    <a className="text-blue-500 hover:underline">
                      {session.user.email}
                    </a>
                  </Link>
                </p>
                <button
                  className="m-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={signOut}
                >
                  Sign out
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  const { db } = await connectToDatabase();

  if (!session) {
    return {
      props: {
        user: null,
        status: "none",
        user_id: null,
      },
    };
  }

  const user = await db.collection("users").findOne(ObjectId(session.id));

  return {
    props: {
      user: session.user,
      status: user.status ? user.status : "none",
      user_id: session.id,
    },
  };
}
