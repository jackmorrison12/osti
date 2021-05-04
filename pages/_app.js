import "../styles/globals.css";
import { Provider } from "next-auth/client";
import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import NavigationBar from "../components/nav/nav";
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }) {
  return (
    <div className="dark:bg-black min-h-screen dark:text-white">
      <Provider session={pageProps.session}>
        <NavigationBar />
        <Component {...pageProps} />
      </Provider>
    </div>
  );
}

export default MyApp;
