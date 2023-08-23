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

// const uniqueName = (userOrg) => {
//   const name = userOrg.replace("_", "-");
//   return `${name + "-" + uuidv4()}`;
// };

const createOIDCConnection = async (
  orgId,
  connectionName,
  displayName,
  discoveryURL,
  clientId,
  clientSecret,
  domain
) => {
  const connections_data = {
    strategy: "oidc",
    // name: uniqueName(orgId),
    name: connectionName,
    display_name: displayName,
    show_as_button: true,
    options: {
      type: "back_channel",
      discovery_url: discoveryURL,
      client_id: clientId,
      client_secret: clientSecret,
      scopes: "openid profile email",
      // tenant_domain: domain,
      domain_aliases: [domain],
    },

    // options: {
    //   type: "front_channel",
    //   discovery_url: discoveryURL,
    //   client_id: clientId,
    //   scopes: "openid profile",
    // },
  };
  console.log(connections_data);
  const connection = await managementClient.connections.create(
    connections_data
  );
  return connection;
};

const enableOIDCConnectionForOrg = async (
  connectionId,
  orgId,
  autoMembership
) => {
  var params = { id: orgId };
  var data = {
    connection_id: connectionId,
    assign_membership_on_login: autoMembership,
  };

  const enabledConn = await managementClient.organizations.addEnabledConnection(
    params,
    data
  );
  return enabledConn;
};

const deleteConnection = async (connectionId) => {
  var data = {
    id: connectionId,
  };

  const enabledConn = await managementClient.connections.delete(data);
  return enabledConn;
};

export default withApiAuthRequired(async function oidc(req, res) {
  console.log("/api/admin/sso/oidc");
  const { user } = await getSession(req, res);
  console.log("user = ", user);
  if (req.method === "POST") {
    //add new SSO connection
    const connection = req.body;
    const connectionName = connection.name;
    const displayName = connection.display_name;
    const connectionStrategy = connection.strategy;
    const discoveryURL = connection.discovery_url;
    const clientId = connection.client_id;
    const clientSecret = connection.client_secret;
    const syncUsersProfile = connection.sync_users_profile;
    const domain = connection.domain;
    const autoMembership = connection.auto_membership.toLowerCase() === "true";

    // const clientSecret = "";
    if (connectionStrategy != "oidc") {
      return res.status(400).json({ msg: "Invalid connection type" });
    }

    if (
      connectionName == "" ||
      displayName == "" ||
      discoveryURL == "" ||
      clientId == "" ||
      clientSecret == "" ||
      syncUsersProfile == "" ||
      domain == ""
    ) {
      return res
        .status(400)
        .json({ msg: "Invalid body. All fields are required." });
    }
    try {
      const new_connection = await createOIDCConnection(
        user.org_id,
        connectionName,
        displayName,
        discoveryURL,
        clientId,
        clientSecret,
        domain
      );
      console.log("new_connection = ", new_connection);

      const enabledConn = await enableOIDCConnectionForOrg(
        new_connection.id,
        user.org_id,
        autoMembership
      );
      console.log("enabledConn = ", enabledConn);

      return res.status(200).json({ msg: "Success" });
    } catch (error) {
      console.log("Failed to create oidc connection for organization: ", error);

      if (error.statusCode == 400) {
        return res.status(400).json({
          msg: "Invalid payload. Server returned " + error.message,
        });
      }

      return res
        .status(500)
        .json({ msg: "Internal error. Server returned " + error.statusCode });
    }
  } else if (req.method === "PUT") {
    //update connection
  } else if (req.method === "DELETE") {
    //delete connection
    try {
      const connection = req.body;
      const connectionId = connection.connection_id;
      deleteConnection(connectionId);
      return res.status(200).json({ msg: "Success" });
    } catch (error) {
      console.log("Failed to delete oidc connection: ", error);

      return res
        .status(500)
        .json({ msg: "Internal error. Server returned " + error.statusCode });
    }
  } else if (req.method === "GET") {
    //fetch connections
  } else {
    //not supported
  }
});
