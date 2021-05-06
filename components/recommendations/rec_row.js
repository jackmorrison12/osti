import React from "react";

export default function RecRow(props) {
  var options = [];
  for (var i = 2; i > -3; i--) {
    options.push(<option value={i}>{i}</option>);
  }

  async function updateBoost(event) {
    await fetch("/api/updateBoost", {
      method: "POST",
      body: JSON.stringify({
        value: event.target.value,
        track_id: event.target.id,
        workout_id: props.wid,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return (
    <tr>
      <td>
        <a href={props.rec.lastfm_url}>
          <img className="inline" src={props.rec.image_url} />
        </a>
      </td>
      <td className="text-center">
        {props.rec.count ? props.rec.count : props.i + 1}
      </td>
      <td>{props.rec.name}</td>
      <td>
        {props.rec.artists
          ? props.rec.artists
              .map(function (a) {
                return a.name;
              })
              .join(", ")
          : props.rec.artist}
      </td>
      <td>
        <select
          name="boost"
          id={props.rec._id}
          className="dark:bg-black border rounded"
          onChange={updateBoost}
          defaultValue={props.rec.boost}
        >
          {options}
        </select>
      </td>
    </tr>
  );
}
