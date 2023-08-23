import { AuthenticationClient } from "auth0";
import axios from "axios";

const baseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const domain = new URL(baseUrl).hostname;

const authenticationClient = new AuthenticationClient({
  domain: domain,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
});

export default async function handler(req, res) {
  try {
    if(req.method === "POST"){

        let authUrl = await axios.get(`${baseUrl}/authorize?response_type=code&client_id=${process.env.AUTH0_CLIENT_ID}&client_secret=${process.env.AUTH0_CLIENT_SECRET}`, { maxRedirects: 0, validateStatus: function (status) {
            return status >= 200 && status < 400; // Don't throw error for redirect response code
        } });

        let state = new URL(baseUrl + authUrl.headers.location).searchParams.get('state');

        let cookie = authUrl.headers["set-cookie"];
        res.setHeader("Set-Cookie", cookie);

        await authenticationClient.requestMagicLink({
            email: req.body.email,
            authParams: { response_type: 'code', state: state }
        })
    }else{
        return res.status(400).json({ msg: "HTTP Method unsupported" });
    }

    return res.status(200).json({});
  } catch (error) {
    console.log("Failed to create user: ", error);

    if (error.statusCode == 400) {
      return res.status(400).json({
        msg: error.message
      });
    }

    if (error.statusCode == 404) {
      return res.status(404).json({ msg: "Failed to create user - Method or resource could not be found!" });
    }

    if (error.statusCode == 409) {
      return res.status(409).json({ msg: error.message });
    }
    return res.status(500).json({ msg: "Internal error" });
  }
};
