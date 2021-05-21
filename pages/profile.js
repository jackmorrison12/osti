import { getSession, signOut } from "next-auth/client";
import Link from "next/link";
import { connectToDatabase } from "../middleware/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";
import { google } from "googleapis";
import { useState } from "react";

var SpotifyWebApi = require("spotify-web-api-node");

export default function Profile({
  user,
  lastfm,
  google_url,
  spotify_url,
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
        <p className="m-6 text-xl">Welcome to Osti {user.name}!</p>
        {lastfm ? (
          <p>Your lastfm account is connected as {lastfm}</p>
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
            <button
              className={
                "text-white font-bold py-2 px-4 rounded-full mt-5 hover:bg-lastfm-light bg-lastfm"
              }
            >
              Connect to Last FM
            </button>
          </a>
        )}
        <br />
        {!google_url ? (
          <p>Your Google Fit account is connected </p>
        ) : (
          <a href={google_url}>
            {" "}
            <button
              className={
                "text-white font-bold py-2 px-4 rounded-full m-4 hover:bg-google-light bg-google"
              }
            >
              Connect to Google
            </button>
          </a>
        )}
        <br />
        {!spotify_url ? (
          <p>Your Spotify account is connected </p>
        ) : (
          <a href={spotify_url}>
            {" "}
            <button
              className={
                "text-white font-bold py-2 px-4 rounded-full m-4 hover:bg-spotify-light bg-spotify"
              }
            >
              Connect to Spotify
            </button>
          </a>
        )}
        <br />

        {!["none", "googlefit_linked", "lastfm_linked"].includes(status) ? (
          <button
            className={
              "text-white font-bold py-2 px-4 rounded-full m-4 " +
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
        <br />
        <button
          className="m-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={signOut}
        >
          Sign out
        </button>
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
  let google_url = null;
  let spotify_url = null;

  if (!user.google_tokens) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_ID,
      process.env.GOOGLE_SECRET,
      process.env.NEXTAUTH_URL + "/api/auth/google"
    );

    const scopes = [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.heart_rate.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
      "https://www.googleapis.com/auth/fitness.location.read",
    ];

    google_url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
  }

  if (!user.spotify_tokens) {
    var scopes = [
        "ugc-image-upload",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "app-remote-control",
        "streaming",
        "playlist-modify-public",
        "playlist-modify-private",
        "playlist-read-private",
        "playlist-read-collaborative",
        "user-read-email",
      ],
      redirectUri = process.env.NEXTAUTH_URL + "/api/auth/spotify",
      clientId = process.env.SPOTIFY_ID,
      state = "connect";

    // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
    var spotifyApi = new SpotifyWebApi({
      redirectUri: redirectUri,
      clientId: clientId,
    });
    // Create the authorization URL
    spotify_url = spotifyApi.createAuthorizeURL(scopes, state);
  }

  return {
    props: {
      user: session.user,
      lastfm: user.lastfm_username ? user.lastfm_username : null,
      google_url: google_url,
      spotify_url: spotify_url,
      status: user.status ? user.status : "none",
      user_id: session.id,
      backend_url: process.env.BACKEND_URL,
    },
  };
}
