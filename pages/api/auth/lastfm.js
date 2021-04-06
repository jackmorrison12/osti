var LastFmNode = require("lastfm").LastFmNode;
import { connectToDatabase } from "../../../middleware/mongodb";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/client";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const global_session = await getSession({ req });

  var lastfm = new LastFmNode({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET,
    useragent: "osti/v0.1 Osti",
  });

  // Get the status variable
  const status = await db
    .collection("users")
    .find({ _id: ObjectId(global_session.id) })
    .project({ status: 1, _id: 0 })
    .toArray();

  lastfm.session({
    token: req.query.token,
    handlers: {
      success: async function (session) {
        await db.collection("users").updateOne(
          { _id: ObjectId(global_session.id) },
          {
            $set: {
              lastfm_key: session.key,
              lastfm_username: session.user,
              status: status[0].status ? "api_linked" : "lastfm_linked",
            },
          },
          { upsert: true }
        );
      },
      error: function (error) {
        console.log(error);
      },
    },
  });

  let user = await db.collection("users").findOne(ObjectId(global_session.id));

  while (!user.lastfm_username) {
    user = await db.collection("users").findOne(ObjectId(global_session.id));
  }

  res.redirect("/profile");
}
