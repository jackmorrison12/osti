import { getSession, signOut } from "next-auth/client";
import Head from "next/head";

export default function Profile({ user }) {
  return (
    <>
      <Head>
        <title>Admin</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto text-center">
        <h1 className="text-6xl m-12">Admin Page</h1>
        <form action="https://fetcher.osti.uk/updateAll" method="post">
          <button
            type="submit"
            className={
              "text-white font-bold py-2 px-4 rounded-full mt-5 bg-blue-500 hover:bg-blue-700"
            }
          >
            Trigger fetch
          </button>
        </form>
        <a href="https://osti-recommender.herokuapp.com/v1">
          <button
            className={
              "text-white font-bold py-2 px-4 rounded-full mt-5 bg-blue-500 hover:bg-blue-700"
            }
          >
            Trigger v1
          </button>
        </a>
        <br />
        <a href="https://osti-recommender.herokuapp.com/v2">
          <button
            className={
              "text-white font-bold py-2 px-4 rounded-full mt-5 bg-blue-500 hover:bg-blue-700"
            }
          >
            Trigger v2
          </button>
        </a>
        <br />
        <a href="https://osti-recommender.herokuapp.com/generate_all_playlists">
          <button
            className={
              "text-white font-bold py-2 px-4 rounded-full mt-5 bg-blue-500 hover:bg-blue-700"
            }
          >
            Trigger playlist update
          </button>
        </a>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);

  if (!session) {
    ctx.res.writeHead(302, { Location: "/" });
    ctx.res.end();
    return {};
  }

  if (session.id != "606c78c40326f734f14f326b") {
    ctx.res.writeHead(302, { Location: "/" });
    ctx.res.end();
    return {};
  }

  return {
    props: {
      user: session.user,
    },
  };
}
