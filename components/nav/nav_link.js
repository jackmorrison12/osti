import React from "react";
import { useSession } from "next-auth/client";

export default function NavigationLink(props) {
  const [session, loading] = useSession();

  return loading ? (
    <></>
  ) : session ? (
    <a
      className="block md:inline hover:underline m-2 md:m-0 md:ml-4"
      href={props.link}
    >
      {props.children}
    </a>
  ) : (
    <></>
  );
}
