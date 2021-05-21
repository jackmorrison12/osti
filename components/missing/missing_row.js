import React, { useState, useRef } from "react";

export default function MissingRow(props) {
  const [uri, setUri] = useState("");
  let btnRef = useRef();

  function handleUriChange(e) {
    setUri(e.target.value);
  }
  async function updateBoost(event) {
    event.preventDefault();
    if (btnRef.current) {
      btnRef.current.setAttribute("disabled", "disabled");
      btnRef.current.setAttribute("hidden", "true");
    }
    await fetch("/api/addUri", {
      method: "POST",
      body: JSON.stringify({
        track_id: props.track._id,
        uri: uri,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return (
    <tr>
      <td>
        <a href={props.track.lastfm_url}>
          <img className="inline" src={props.track.image_url} />
        </a>
      </td>
      <td className="text-center">{props.track.count}</td>
      <td>{props.track.name}</td>
      <td>{props.track.artist}</td>
      <td>
        <form id={props.track._id}>
          <input
            type="text"
            className="dark:bg-black border rounded"
            id="uri"
            value={uri}
            onChange={handleUriChange}
          />
          <input
            className="dark:bg-black border rounded"
            type="submit"
            value="Submit"
            onClick={updateBoost}
            ref={btnRef}
          />
        </form>
      </td>
    </tr>
  );
}
