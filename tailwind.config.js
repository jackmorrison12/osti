module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        lastfm: {
          DEFAULT: "#c3000d",
          light: "#d1626a",
        },
        google: {
          DEFAULT: "#3cba54",
          light: "#89c995",
        },
        spotify: {
          DEFAULT: "#1DB954",
          light: "#8ef5b2",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
