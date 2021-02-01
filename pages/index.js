import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/client";

export default function Home() {
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
                Not signed in <br />
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
                Signed in as{" "}
                <Link href="/profile">
                  <a className="text-blue-500 hover:underline">
                    {session.user.email}
                  </a>
                </Link>
                <br />
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
