const User = require("./models/User");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
          // Ensure GoogleId is linked
          if (!user.googleId) {
            user.googleId = googleId;
          }
          // Update missing fields
          user.firstname = user.firstname || profile.name?.givenName;
          user.lastname = user.lastname || profile.name?.familyName;
          user.avatar =
            user.avatar ||
            (profile.photos?.[0]?.value ? profile.photos[0].value : undefined);
          user.locale = user.locale || profile._json?.locale;
          user.gender = user.gender || profile._json?.gender;
          user.isVerified = true;
          user.isActive = true;

          await user.save();
        } else {
          // Recreate user cleanly if deleted
          user = await User.create({
            googleId,
            email,
            firstname: profile.name?.givenName,
            lastname: profile.name?.familyName,
            avatar: profile.photos?.[0]?.value,
            locale: profile._json?.locale,
            gender: profile._json?.gender,
            isVerified: true,
            isActive: true,
            role: "customer", // default role
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("GoogleStrategy error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
