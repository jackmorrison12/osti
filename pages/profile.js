import { getSession } from "next-auth/client";
import Link from "next/link";
import { connectToDatabase } from "../middleware/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";
import { google } from "googleapis";
import { useState } from "react";

export default function Profile({
  user,
  lastfm,
  google_url,
  status,
  user_id,
  backend_url,
}) {
  const [result, setResult] = useState(status);

  const setup = (user_id) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("user_id", user_id);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };
    var url =
      process.env.NODE_ENV === "development"
        ? "http://localhost:4000"
        : "https://fetcher.osti.uk";

    fetch(url + "/setup", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setResult(result);
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <>
      <Head>
        <title>Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto text-center">
        <h1 className="text-6xl m-12">Profile Page</h1>
        <img className="inline" src={user.image} />
        <p className="m-6 text-xl">
          Welcome {user.name} - this page can only be seen by a logged in user!
        </p>
        {lastfm ? (
          <p>You're lastfm account is connected as {lastfm}</p>
        ) : (
          <a
            href={
              "http://www.last.fm/api/auth/?api_key=" +
              process.env.LASTFM_KEY +
              "&cb=" +
              process.env.NEXTAUTH_URL +
              "/api/auth/lastfm"
            }
          >
            Connect to lastfm
          </a>
        )}
        {!google_url ? (
          <p>You're Google Fit account is connected </p>
        ) : (
          <a href={google_url}>Connect to google</a>
        )}

        {!["none", "googlefit_linked", "lastfm_linked"].includes(status) ? (
          <button
            className={
              "text-white font-bold py-2 px-4 rounded-full mt-5 " +
              (status == "api_linked"
                ? "hover:bg-blue-700 bg-blue-500"
                : "bg-blue-300")
            }
            style={status != "api_linked" ? { cursor: "default" } : {}}
            onClick={() => setup(user_id)}
            disabled={status != "api_linked"}
          >
            Fetch Data: {result}
          </button>
        ) : (
          ""
        )}

        <p className="m-2 text-l">
          Return to{" "}
          <Link href="/">
            <a className="text-blue-500 hover:underline">home</a>
          </Link>
        </p>
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
  let url = null;

  if (!user.google_tokens) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_ID,
      process.env.GOOGLE_SECRET,
      process.env.NEXTAUTH_URL + "/api/auth/google"
    );

    const scopes = [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.heart_rate.read",
      "https://www.googleapis.com/auth/fitness.location.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
      "https://www.googleapis.com/auth/fitness.body.read",
    ];

    url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
  }

  return {
    props: {
      user: session.user,
      lastfm: user.lastfm_username ? user.lastfm_username : null,
      google_url: url,
      status: user.status ? user.status : "none",
      user_id: session.id,
      backend_url: process.env.BACKEND_URL,
    },
  };
}
