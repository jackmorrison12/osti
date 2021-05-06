import React from "react";
import RecRow from "./rec_row";

export const RecList = (props) => (
  <>
    <h1 className="text-2xl xl:text-3xl m-3 xl:m-12 xl:mt-0">{props.title}</h1>
    <table className="table-fixed w-full text-left">
      <thead>
        <tr>
          <th className="w-1/12"></th>
          <th className="w-1/12 text-center">Pos</th>
          <th className="w-4/12">Track</th>
          <th className="w-4/12">Artist</th>
          <th className="w-2/12">Boost</th>
        </tr>
      </thead>
      <tbody>
        {" "}
        {props.recs.map((rec, i) => (
          <RecRow rec={rec} i={i} />
        ))}
      </tbody>
    </table>
  </>
);

export default RecList;
