/*!
 * Module dependencies.
 */

var console = require('./console');

/**
 * Command line logout.
 *
 * Logout of the current account and report whether it was a success or failure.
 *
 * Options:
 *
 *   - `argv` {Object} is an optimist object.
 *   - `callback` {Function} is a completion callback.
 */

module.exports = function(argv, callback) {
    this.phonegapbuild.logout(argv, function(e) {
        if (e) {
            console.error('failed to logout:', e.message);
        }
        else {
            console.log('logged out of', 'build.phonegap.com'.underline);
        }

        callback(e);
    });
};
