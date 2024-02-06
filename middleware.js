import { NextResponse } from 'next/server'
import { withMiddlewareAuthRequired, getAccessToken } from "@auth0/nextjs-auth0/edge";

export default withMiddlewareAuthRequired(async function middleware(req) {
  const res = NextResponse.next();
  const accessToken = await getAccessToken(req, res);
  res.cookies.set('retail0_access_token', accessToken.accessToken);
  return res;
});

export const config = {
  matcher: ["/account/:path*"],
};
