const express = require('express');
const router = express.Router();

const ExpressError = require("../expressError");

const db = require('../db');
const User = require('../models/user')
const Message = require('../models/message')
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth')

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', async (req, res, next) => {
    try {
        let results = User.all();
        return res.json({results})
    } catch (e) {
        next(e);
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', async (req, res, next) => {
    try {
        let { username } = req.params;
        let results = User.get(username);
        return res.json({results});
    } catch(e) {
        next(e);
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', ensureCorrectUser, async (req, res, next) => {
    let { username } = req.params;
    let messages = User.messagesTo(username);
    return res.json({messages: messages});
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', ensureCorrectUser, async (req, res, next) => {
    let { username } = req.params;
    let messages = User.messagesFrom(username);
    return res.json({messages: messages});
})

module.exports = router;