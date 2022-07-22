const LocalStratergy = require("passport-local").Strategy;

function initialize(passport, getUserByEmail, getUserById, hashedPassword){
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if(user == null){
            return done(null, false, { message: "no user with that email"});
        }
        const comparePassword = await hashedPassword(email, password);
        if (comparePassword == true){
            return done(null, user);
        } else{
            return done(null, false, {message: "Wrong password"});
        }
    }
    passport.use(new LocalStratergy({usernameField : "email"}, 
    authenticateUser));
    passport.serializeUser((user, done) => {
        return done(null,user.id);
    });
    passport.deserializeUser((id,done) => {
        return done(null,getUserById(id));
    });
}

module.exports = initialize;