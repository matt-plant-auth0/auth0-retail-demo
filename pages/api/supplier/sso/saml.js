import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { ManagementClient } from "auth0";

const baseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const domain = new URL(baseUrl).hostname;

const managementClient = new ManagementClient({
  domain: domain,
  clientId: process.env.AUTH0_M2M_CLIENT_ID,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
  scope: process.env.AUTH0_M2M_SCOPES,
});

export default withApiAuthRequired(async function saml(req, res) {
  if (req.method === "POST") {
    //add new SSO connection
  } else if (req.method === "PUT") {
    //update connection
  } else if (req.method === "DELETE") {
    //delete connection
  } else if (req.method === "GET") {
    //fetch connections
  } else {
    //not supported
  }

  const { org_name } = req.query;

  if (!org_name) {
    return res
      .status(400)
      .json({ msg: "Organization name identifier is required." });
  }
});
