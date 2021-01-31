import nextConnect from "next-connect";
import middleware from "../../middleware/database";
import { getSession } from "next-auth/client";
import { ObjectId } from "mongodb";

const handler = nextConnect();
handler.use(middleware);

handler.get(async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    let doc = "Not Signed In!";
    res.status(403).json(doc);
  } else {
    let doc = await req.db.collection("users").findOne(ObjectId(session.id));

    res.status(200).json(doc);
  }
});
export default handler;
