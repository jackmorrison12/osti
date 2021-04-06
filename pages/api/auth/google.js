import { connectToDatabase } from "../../../middleware/mongodb";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/client";
import { google } from "googleapis";

export default async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET,
    process.env.NEXTAUTH_URL + "/api/auth/google"
  );

  const { tokens } = await oauth2Client.getToken(req.query.code);
  oauth2Client.setCredentials(tokens);

  const { db } = await connectToDatabase();
  const global_session = await getSession({ req });

  // Get the status variable
  const status = await db
    .collection("users")
    .find({ _id: ObjectId(global_session.id) })
    .project({ status: 1, _id: 0 })
    .toArray();

  // Store google token object
  await db.collection("users").updateOne(
    { _id: ObjectId(global_session.id) },
    {
      $set: {
        google_tokens: tokens,
        status: status[0].status ? "api_linked" : "googlefit_linked",
      },
    },
    { upsert: true }
  );

  res.redirect("/profile");
}
