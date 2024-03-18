const express = require('express');
const router = express.Router();

const ExpressError = require("../expressError");

const db = require('../db');
const Message = require('../models/message')
const { ensureCorrectUser } = require('../middleware/auth')

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureCorrectUser, async (res, req, next) => {
    let { id } = req.params;
    let messages = Message.get(id);
    return res.json({message: messages});
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', async (res, req, next) => {
    let { to_username, body } = req.body;
    let message = Message.create(req.user, to_username, body);

    return res.json({Msg: "Message Sent!"});
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureCorrectUser, async (res, eq, next) => {
    let { id } = req.params;
    let response = Message.markRead(id);
    return res.json(response);
})

module.exports = router;