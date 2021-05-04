import React from "react";
import NavigationLink from "./nav_link";
import Brand from "./brand";

export const NavigationBar = () => (
  <div className="w-full md:flex md:p-4 text-center md:text-left">
    <Brand brandName="Osti" />
    <NavigationLink link="/profile">Profile</NavigationLink>
    <NavigationLink link="/recommendations">Recommendations</NavigationLink>
  </div>
);

export default NavigationBar;
