import React from "react";

export const RecList = (props) => (
  <>
    <h1 className="text-2xl xl:text-3xl m-12">{props.title}</h1>
    <table className="table-fixed w-full">
      <thead>
        <tr>
          <th className="w-1/12"></th>
          <th className="w-2/12">Pos</th>
          <th className="w-5/12">Track</th>
          <th className="w-4/12">Artist</th>
        </tr>
      </thead>
      <tbody>
        {" "}
        {props.recs.map((rec, i) => (
          <tr>
            <td>
              <a href={rec.lastfm_url}>
                <img className="inline" src={rec.image_url} />
              </a>
            </td>
            <td>{i + 1}</td>
            <td>{rec.name}</td>
            <td>
              {rec.artists
                ? rec.artists
                    .map(function (a) {
                      return a.name;
                    })
                    .join(", ")
                : rec.artist}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

export default RecList;
