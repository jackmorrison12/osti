import React from "react";

export const Brand = (props) => (
  <a
    href="/"
    className="hover:underline font-bold uppercase block mt-2 md:mt-0 md:inline"
  >
    {props.brandName}
  </a>
);

export default Brand;
