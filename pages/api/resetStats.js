import nextConnect from "next-connect";
import middleware from "../../middleware/database";
import { getSession } from "next-auth/client";

const handler = nextConnect();
handler.use(middleware);

handler.post(async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    let doc = "Not Signed In!";
    res.status(403).json(doc);
  } else {
    let doc = await req.db.collection("user_workout_stats").deleteOne({
      user_id: session.id,
      workout_id: req.body.workout_id,
      default: false,
    });
    res.status(200).json(doc);
  }
});
export default handler;
