import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { ManagementClient } from "auth0";

const baseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const domain = new URL(baseUrl).hostname;

const managementClient = new ManagementClient({
  domain: domain,
  clientId: process.env.AUTH0_M2M_CLIENT_ID,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
  scope: process.env.AUTH0_M2M_SCOPES,
});

export default withApiAuthRequired(async function handler(req, res) {
  try {

    const session = await getSession(req, res);
    const user_id = session.user.sub;

    let userToReturn = null;

    switch(req.method){
        case "GET":
            userToReturn = await managementClient.getUser( { id: user_id } );
            break;
        case "PUT":
        case "PATCH":
            let account = {
              name: `${req.body.given_name} ${req.body.family_name}`,
              given_name: req.body.given_name,
              family_name: req.body.family_name,
              app_metadata: {
                weekly_emails: req.body.weekly_emails,
                partner_emails: req.body.partner_emails
              }
            }
            userToReturn = await managementClient.updateUser( { id: user_id }, account );
            break;
        default:
            return res.status(400).json({ msg: "HTTP Method unsupported" });
    }

    return res.status(200).json(userToReturn);
  } catch (error) {
    console.log("User API Failed: ", error);

    if (error.statusCode == 400) {
      return res.status(400).json({
        msg: error.message
      });
    }

    if (error.statusCode == 404) {
      return res.status(404).json({ msg: "User API failed - Method or resource could not be found!" });
    }

    if (error.statusCode == 409) {
      return res.status(409).json({ msg: error.message });
    }
    return res.status(500).json({ msg: "Internal error" });
  }
});
