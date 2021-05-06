import React from "react";

export default function RecRow(props) {
  var options = [];
  for (var i = 2; i > -3; i--) {
    options.push(
      <option value={i} selected={props.rec.boost == i}>
        {i}
      </option>
    );
  }
  return (
    <tr id={props.rec._id}>
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
        <select name="cars" id="cars" className="dark:bg-black border rounded">
          {options}
        </select>
      </td>
    </tr>
  );
}
