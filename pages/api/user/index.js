import { ManagementClient } from "auth0";
import { ordersRepo } from "../../../utils/orders-repo";
import Error from "next/error";

const baseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const domain = new URL(baseUrl).hostname;

const managementClient = new ManagementClient({
  domain: domain,
  clientId: process.env.AUTH0_M2M_CLIENT_ID,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
  scope: 'read:users update:users create:users create:user_tickets'
});

function generateTemporaryPassword () {
    var length = 28,
        lowercase = "abcdefghijklmnopqrstuvwxyz",
        uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        numbers = "0123456789",
        special = "!@#$%^&*?()_-`~<>.,{}[]|+=",
        charset = lowercase + uppercase + numbers + special,
        password = "";

    for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }

    password += lowercase.charAt(Math.floor(Math.random() * n));
    password += uppercase.charAt(Math.floor(Math.random() * n));
    password += numbers.charAt(Math.floor(Math.random() * n));
    password += special.charAt(Math.floor(Math.random() * n));

    //shuffle the password characters
    var passwordChars = password.split('');
    var tmp, current, top = passwordChars.length;

    if (top)
        while (--top) {
            current = Math.floor(Math.random() * (top + 1));
            tmp = passwordChars[current];
            passwordChars[current] = passwordChars[top];
            passwordChars[top] = tmp;
        }

    return passwordChars.join('');
}

export default async function handler(req, res) {
  try {

    let userToReturn = null;

    if(req.method === "POST"){
        let personalDetails = req.body.personalDetails;
        let existingAccounts = await managementClient.getUsersByEmail(personalDetails.email);
        let newUser = personalDetails;
        let userOrders = ordersRepo.filter(x => x.email === personalDetails.email);
        let orderIds = [];
        if(userOrders && userOrders.length > 0){
            orderIds = userOrders.map(order => { return order.id });
        }

        newUser.name = `${personalDetails.given_name} ${personalDetails.family_name}`;
        newUser.app_metadata = { 
            terms_accepted: Date.now(),
            privacy_accepted: Date.now(),
            weekly_emails: false,
            partner_emails: false,
            orders: orderIds 
        }
        newUser.password = generateTemporaryPassword();
        newUser.connection = 'Username-Password-Authentication';
        userToReturn = await managementClient.createUser(newUser);

        if(existingAccounts.length > 0){
          console.log(existingAccounts);
          //may have passwordless account with marketing preferences that needs to be linked and merged
          if(existingAccounts.length === 1){
            let metadataToMerge = existingAccounts[0].app_metadata;
            metadataToMerge.orders = orderIds;
            metadataToMerge.isSubscriptionAccount = false;
            userToReturn = await managementClient.updateUser( { id: userToReturn.user_id }, { app_metadata: metadataToMerge } );

            var params = {
              user_id: existingAccounts[0].user_id,
              provider: 'email'
            };
            await managementClient.linkUsers(userToReturn.user_id, params);
          }else{
            //here be dragons...
            throw new Error({message: `Multiple accounts for ${personalDetails.email} detected!`});
          }
        }

        let ticket = await managementClient.createPasswordChangeTicket({
          user_id: userToReturn.user_id,
          client_id: process.env.AUTH0_CLIENT_ID
        });
        userToReturn.setPasswordUrl = ticket.ticket;
        
    }else{
        return res.status(400).json({ msg: "HTTP Method unsupported" });
    }

    return res.status(200).json(userToReturn);
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
