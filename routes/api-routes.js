var db = require("../models")
const bcrypt = require("bcryptjs")
const passport = require("passport")

module.exports = function (app) {

    // This will add the currently logged in user's username to the account/{username} URL and redirect them to it
    // The "Account" link in the navbar uses this route
    app.get("/api/acctredirect", function(req, res) {
        let username = req.user.username
        res.redirect("/account/" + username)
    })
    
    app.post("/api/register", function (req, res) {
        console.log(req.body)
        // Bring in the reqs so that we can do some checks here (we could move this to another file later)
        const { username, password, password2 } = req.body;
        let errors = [];
        // Check that fields are filled
        if (!username || !password || !password2) {
            errors.push({ msg: 'please fill in all fields' })
        };
        // Check that password match
        if (password !== password2) {
            errors.push({ msg: 'Password must match!' })
        };
        // Check password length
        if (password.length < 0) {
            errors.push({ msg: 'Password must contain at least 0 characters' })
        };
        // If there are errors, send back the errors and username
        // This is useless for now, but we can add a partials folder with an 'errors' file inside and call that on the register page
        // We can pass the object from this res.render to show those error messages above on the page when a user makes an error
        if (errors.length > 0) {
            res.render("register", {
                errors,
                username
            });
            // Otherwise log success and create a new row on the users table
        } else {
            // Check if the username exists
            db.Users.findOne({
                where: {
                    username: username
                }
            }).then(function (user) {
                if (user) {
                    // If the username exists, let the user know
                    // Just like above, this won't work without a partials folder and errors file
                    errors.push({ msg: 'This username already exists' });
                    res.render("register", {
                        errors,
                        username
                    })
                }
                else {
                    // Password encryption
                    // This generates an encrytion 'salt' whatever that means
                    bcrypt.genSalt(10, function (err, salt) {
                        // This uses that 'salt' and creates a hashed password
                        bcrypt.hash(password, salt, function (err, hash) {
                            if (err) throw err;
                            // Post to the Users table and use the hash as the password
                            db.Users.create({
                                username,
                                password: hash
                            }).then(function () {
                                // Send the user to the login page
                                res.redirect("/login")
                            })
                        })
                    })
                }
            })
        }
    });

    app.post("/api/login", function(req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        })(req, res, next)
    });

    app.post("/api/newPost", function(req,res){
        console.log(req.body);
        db.Posts.create({
            title: "title1",
            image: "image1",
            totalVotes: 0,

        })
      

    });


}

// Still need:


// Update Users Route
// db.Users.update password ---- so users can update their passwords



// Create/Update Posts Routes
// db.Posts.create post  ---- so users can create post



// db.Posts.update title  ---- so users can update titles of posts




// Create/Update Captions Routes
// db.Captions.create caption  ---- so users can create new captions

// db.Captions.update noOfVotes  ---- to update votes when a user votes on a caption



// Create/Update Votes Routes
// db.Votes.create vote  ---- will create a new vote when a user clicks the button

// db.Votes.update (just update. it has foreign keys that will change without any extra code from us) ---- if a user votes on a different caption



// Delete Routes
// db.Users.destroy user 

// db.Posts.destroy post

// db.Captions.destroy captions
