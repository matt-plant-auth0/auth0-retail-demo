import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';
import { hasCookie, getCookie } from 'cookies-next';


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
        const { connection, login_hint, iss } = req.query;

        let current_email = '';

        if(hasCookie('current_email', { req, res })){
          current_email = getCookie('current_email', { req, res });
          console.log('Current email: ' + current_email);
        }

        if (!connection) {
          await handleLogin(req, res);
        } else if (iss) {
          await handleLogin(req, res, {
            authorizationParams: {
              login_hint: current_email
            }
          });
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
    callback: async (req, res) => {
      //either just pop a 'toast' which may not need this code block, or redirect to their favourite category here
      const afterCallback = (req, res, session, state) => {
        if (session.user.favourite_categories) {
          res.setHeader('Location', '/category/football-shirts');
          return session;
        } else {
          return session;
        }
      };
      await handleCallback(req, res, { afterCallback });
    }
  });