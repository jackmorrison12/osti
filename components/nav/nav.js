import React from "react";
import NavigationLink from "./nav_link";
import Brand from "./brand";
import { useSession } from "next-auth/client";

export default function NavigationBar(props) {
  const [session, loading] = useSession();
  return (
    <div className="w-full md:flex md:p-4 text-center md:text-left">
      <Brand brandName="Osti" />
      <NavigationLink link="/profile">Profile</NavigationLink>
      <NavigationLink link="/recommendations">Recommendations</NavigationLink>
      {loading ? (
        ""
      ) : session && session.id == "606c78c40326f734f14f326b" ? (
        <NavigationLink link="/admin">Admin</NavigationLink>
      ) : (
        ""
      )}
    </div>
  );
}
