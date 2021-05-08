import React from "react";
import MissingRow from "./missing_row";

export const MissingList = (props) => (
  <>
    <h1 className="text-2xl xl:text-3xl m-3 xl:m-12 xl:mt-0">{props.title}</h1>
    <table className="table-fixed w-full text-left">
      <thead>
        <tr>
          <th className="w-1/12"></th>
          <th className="w-1/12 text-center">Count</th>
          <th className="w-4/12">Track</th>
          <th className="w-3/12">Artist</th>
          <th className="w-3/12">Spotify URL</th>
        </tr>
      </thead>
      <tbody>
        {" "}
        {props.unknown_tracks.map((track, i) => (
          <MissingRow track={track} />
        ))}
      </tbody>
    </table>
  </>
);

export default MissingList;
