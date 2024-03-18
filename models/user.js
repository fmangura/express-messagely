/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(
          `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at) 
            VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
            RETURNING username, password, first_name, last_name, phone`,
            [username, hashedPassword, first_name, last_name, phone]);

    return results.rows[0];

    }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const results = await db.query(
      `SELECT username, password 
        FROM users WHERE username = $1`,
        [username])
    
    let user = results.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password)){
        return user
      } else {
        return false;
      }
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const results = await db.query(
      `UPDATE users 
        SET last_login_at=current_timestamp 
        WHERE username=$1`,
        [username])
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`
      SELECT username, first_name, last_name, phone
      FROM users`);
    return results.rows;

  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    let results = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users
      WHERE username=$1`,
      [username])

    return results.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    let results = await db.query(
      `SELECT 
          m.id, 
          m.to_username, 
            t.first_name, 
            t.last_name, 
            t.phone, 
          m.body, 
          m.sent_at, 
          m.read_at
        FROM messages as m
          JOIN users AS f ON m.from_username = f.username
          JOIN users AS t ON m.to_username = t.username
        WHERE from_username=$1`,
        [username])
    
    let i = results.rows[0];

    if (!i) {
      throw new ExpressError(`No such message: ${id}`, 404);
    }

    return [{
      id: i.id,
      to_user: {
        username: i.to_username,
        first_name: i.first_name,
        last_name: i.last_name,
        phone: i.phone,
      },
      body: i.body,
      sent_at: i.sent_at,
      read_at: i.read_at
    }]
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    let results = await db.query(
      `SELECT 
          m.id, 
          m.from_username, 
            u.first_name, 
            u.last_name, 
            u.phone, 
          m.body, 
          m.sent_at, 
          m.read_at
        FROM messages as m
          JOIN users AS u ON m.from_username = u.username
        WHERE to_username=$1`,
        [username])
    
    let i = results.rows[0];

    if (!i) {
      throw new ExpressError(`No such message: ${id}`, 404);
    }

    return [{
      id: i.id,
      from_user: {
        username: i.from_username,
        first_name: i.first_name,
        last_name: i.last_name,
        phone: i.phone,
      },
      body: i.body,
      sent_at: i.sent_at,
      read_at: i.read_at
    }]
  }
}


module.exports = User;