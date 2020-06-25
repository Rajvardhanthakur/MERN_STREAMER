const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const { User } = require('./models/user');

const app = express();

mongoose.connect(config.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log('DB Connected')).catch(err => console.error(err));

app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json())
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({"hello ": "world"})
})

app.post('/api/users/register', (req, res) => {
    const user = new User(req.body)

    user.save((err, userData) => {
        if(err) return res.json ({ success: false, err})

        return res.status(200).json({
            success:true
        })
    })
})

app.post('/api/user/login', (req, res) => {
    //find the email
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user)
        return res.json({
            loginSuccess: false,
            message: "Auth failed, email not found"
        })

        //comparePassword

        user.comparePassword(req.body.password, (err, isMatch)=> {
            if(!isMatch){
                return res.json ({ loginSuccess: false, message: "wrong password"})
            }
        })

        //generateToken
        user.generateToken((err, user) => {
            if(err) return res.status(400).send(err);
            res.cookie("x_auth", user.token)
                .status(200)
                .json({
                    loginSuccess: true
                })
        })
    })
});



app.listen(5000);