import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
    signup: async (req, res) => {
        try {
            const { connection } = req.query;

            if (!connection) {
                await handleLogin(req, res);
              } else {
                await handleLogin(req, res, {
                    authorizationParams: {
                        screen_hint: "signup",
                        connection: connection
                    },
                    returnTo: "/",
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    /* logic for > "/pages/api/auth/login" */
    login: async (req, res) => {
      try {
        const { connection, login_hint } = req.query;

        if (!connection) {
          await handleLogin(req, res);
        } else {
          await handleLogin(req, res, {
            authorizationParams: {
              connection: connection,
              login_hint: login_hint
            },
            returnTo: "/account/profile",
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
  });