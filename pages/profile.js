import { getSession } from "next-auth/client";
import Link from "next/link";

export default function Profile({ user }) {
  return (
    <div className="container mx-auto text-center">
      <h1 className="text-6xl m-12">Profile Page</h1>
      <img className="inline" src={user.image} />
      <p className="m-6 text-xl">
        Welcome {user.name} - this page can only be seen by a logged in user!
      </p>
      <p className="m-2 text-l">
        Return to{" "}
        <Link href="/">
          <a className="text-blue-500 hover:underline">home</a>
        </Link>
      </p>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) {
    ctx.res.writeHead(302, { Location: "/" });
    ctx.res.end();
    return {};
  }

  return {
    props: {
      user: session.user,
    },
  };
}
