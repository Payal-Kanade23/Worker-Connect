import passport from 'passport';
import { Strategy as GoogleStrategy, type Profile } from 'passport-google-oauth20';
import { findUserByEmail, createGoogleUser } from '../models/User.js';
import type { GoogleUser } from '../type/types.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (
      accessToken: string, //i dont use this is google's accesstoken and refreshtoken
      refreshToken: string,
      profile: Profile,
      done: (error: Error | null, user?: GoogleUser | false) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        
        if (!email) {
          return done(new Error('Google account has no email'));
        }



        let user = await findUserByEmail(email);
        if (!user) {
          // First time this Google account has signed in — create the
          // user with role = null. They'll pick worker/customer on the
          // frontend via PATCH /auth/role after being redirected there.
          user = await createGoogleUser({ name, email, role: null });
        }


        const googleUser: GoogleUser = {
          ...user,
          needsRoleSelection: !user.role,
        };
        done(null, googleUser);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

export default passport;