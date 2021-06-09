import React, { useState } from "react";
import cloneDeep from "lodash/cloneDeep";

export default function Stats({ default_stats, custom_stats, workout }) {
  var [stats, setStats] = useState(
    custom_stats ? cloneDeep(custom_stats) : cloneDeep(default_stats)
  );
  const [updated, setUpdated] = useState(false);
  const [def, setDef] = useState(stats.default);
  const [key, setKey] = useState(Date.now());

  async function saveChanges(event) {
    setDef(false);
    setUpdated(false);

    await fetch("/api/saveStats", {
      method: "POST",
      body: JSON.stringify({
        workout_id: workout._id,
        stats: stats.stats,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async function resetChanges(event) {
    setDef(true);
    setStats(default_stats);
    setUpdated(false);
    setKey(Date.now());
    await fetch("/api/resetStats", {
      method: "POST",
      body: JSON.stringify({
        workout_id: workout._id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async function valueUpdate(event) {
    setUpdated(true);
    if (!isNaN(parseFloat(event.target.value))) {
      stats.stats[event.target.id] = parseFloat(event.target.value);
    }
  }
  return (
    <>
      <div className="pb-10">
        <h1 className="pb-5">
          Here are your {def ? "default" : "custom"}{" "}
          {workout.name.toLowerCase()} statistics:
        </h1>{" "}
        <table className="table-fixed w-full">
          <thead>
            <tr>
              <th className="w-2/12">Average Length</th>
              <th className="w-2/12">Average Calories</th>
              <th className="w-2/12">Average Heart Rate</th>
              <th className="w-2/12">Average Distance</th>
              <th className="w-2/12">Average Speed</th>
              <th className="w-2/12">Average Steps</th>
            </tr>
          </thead>
          <tbody>
            <tr key={key}>
              <td>
                {stats.stats.average_length ? (
                  <>
                    <input
                      name="average_length"
                      id="average_length"
                      className="dark:bg-black border rounded w-full xl:w-1/2 text-right"
                      onChange={valueUpdate}
                      defaultValue={stats.stats.average_length.toFixed(0)}
                    ></input>{" "}
                    minutes
                  </>
                ) : (
                  "n/a"
                )}
              </td>
              <td>
                {stats.stats.average_calories ? (
                  <>
                    <input
                      name="average_calories"
                      id="average_calories"
                      className="dark:bg-black border rounded w-full xl:w-1/2 text-right"
                      onChange={valueUpdate}
                      defaultValue={stats.stats.average_calories.toFixed(0)}
                    ></input>{" "}
                    kcal
                  </>
                ) : (
                  "n/a"
                )}
              </td>
              <td>
                {stats.stats.average_heart_rate ? (
                  <>
                    <input
                      name="average_heart_rate"
                      id="average_heart_rate"
                      className="dark:bg-black border rounded w-full xl:w-1/2 text-right"
                      onChange={valueUpdate}
                      defaultValue={stats.stats.average_heart_rate.toFixed(0)}
                    ></input>{" "}
                    bpm
                  </>
                ) : (
                  "n/a"
                )}
              </td>
              <td>
                {stats.stats.average_distance ? (
                  <>
                    <input
                      name="average_distance"
                      id="average_distance"
                      className="dark:bg-black border rounded w-full xl:w-1/2 text-right"
                      onChange={valueUpdate}
                      defaultValue={stats.stats.average_distance.toFixed(0)}
                    ></input>{" "}
                    m
                  </>
                ) : (
                  "n/a"
                )}
              </td>
              <td>
                {stats.stats.average_speed ? (
                  <>
                    <input
                      name="average_speed"
                      id="average_speed"
                      className="dark:bg-black border rounded w-full xl:w-1/2 text-right"
                      onChange={valueUpdate}
                      defaultValue={stats.stats.average_speed.toFixed(2)}
                    ></input>{" "}
                    m/s
                  </>
                ) : (
                  "n/a"
                )}
              </td>
              <td>
                {stats.stats.average_steps ? (
                  <>
                    <input
                      name="average_steps"
                      id="average_steps"
                      className="dark:bg-black border rounded w-full xl:w-1/2 text-right"
                      onChange={valueUpdate}
                      defaultValue={stats.stats.average_steps.toFixed(0)}
                    ></input>{" "}
                    steps
                  </>
                ) : (
                  "n/a"
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <button
          className={
            "hover:bg-gray-100 dark:hover:bg-gray-800 " +
            "font-semibold py-2 px-4 border " +
            "border-gray-400 rounded mt-5 + " +
            (!updated ? "bg-gray-100 dark:bg-gray-800" : "")
          }
          disabled={!updated}
          style={!updated ? { cursor: "default" } : {}}
          onClick={saveChanges}
        >
          Save Changes
        </button>
        <button
          className={
            "hover:bg-gray-100 dark:hover:bg-gray-800 " +
            "font-semibold py-2 px-4 border " +
            "border-gray-400 rounded mt-5 ml-5 " +
            (def ? "bg-gray-100 dark:bg-gray-800" : "")
          }
          disabled={def}
          style={def ? { cursor: "default" } : {}}
          onClick={resetChanges}
        >
          Reset Statistics
        </button>
      </div>
    </>
  );
}
