import React from "react";

export const RecRow = (props) => (
  <tr>
    <td>
      <a href={props.rec.lastfm_url}>
        <img className="inline" src={props.rec.image_url} />
      </a>
    </td>
    <td className="text-center">{props.i + 1}</td>
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
        <option value="2">2</option>
        <option value="1">1</option>
        <option value="0" selected>
          0
        </option>
        <option value="-1">-1</option>
        <option value="-2">-2</option>
      </select>
    </td>
  </tr>
);

export default RecRow;
