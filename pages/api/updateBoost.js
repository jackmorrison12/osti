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
    let doc = await req.db.collection("boosts").updateOne(
      {
        user_id: session.id,
        workout_id: req.body.workout_id,
        track_id: req.body.track_id,
      },
      {
        $set: {
          user_id: session.id,
          workout_id: req.body.workout_id,
          track_id: req.body.track_id,
          value: req.body.value,
        },
      },
      { upsert: true }
    );
    res.status(200).json(doc);
  }
});
export default handler;
