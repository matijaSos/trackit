import { defineUserSignupFields as defineAdditionalSignupFields } from "wasp/server/auth";

export default defineAdditionalSignupFields({
  username: (data) => {
    return data.email as string
  },
  isAdmin: (data) => {
    if (!data.email) {
      return false;
    } 
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    return adminEmails.includes(data.email as string);
  },
});