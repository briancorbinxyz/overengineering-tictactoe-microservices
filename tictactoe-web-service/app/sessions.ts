// https://remix.run/docs/en/main/utils/sessions
import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  userId: string;
  playerId: string;
  gameId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    // TODO: remove example settings as needed
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__session",

      // all of these are optional
      // domain: "remix.run", // setting the wrong domain breaks it...
      // Expires can also be set (although maxAge overrides it when used in combination).
      // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
      //
      // expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 60 * 5,
      path: "/",
      sameSite: "lax",
      secrets: ["s3cret1"],
      secure: process.env.NODE_ENV === "production", // disable in dev
    },
  });

export { commitSession, destroySession, getSession };