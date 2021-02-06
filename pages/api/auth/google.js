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

  await db.collection("users").updateOne(
    { _id: ObjectId(global_session.id) },
    {
      $set: {
        google_refresh_token: tokens.refresh_token,
      },
    },
    { upsert: true }
  );

  res.redirect("/profile");
}
