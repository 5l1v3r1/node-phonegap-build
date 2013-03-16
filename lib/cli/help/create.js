/**
 * Help commmand for create.
 *
 * Outputs the usage information for the create command.
 *
 * Options:
 *
 *   - `argv` {Object} is an optimist object.
 *   - `callback` {Function} is a completion callback.
 */

module.exports = function(argv, callback) {
    var help = [
        '',
        '  Usage: ' + argv.$0 + ' create [options] <path>',
        '',
        '  Description:',
        '',
        '    Create a new application.',
        '',
        '  Examples:',
        '',
        '    $ ' + argv.$0 + ' create ./my-app',
        ''
    ];

    console.log(help.join('\n'));

    callback(null);
};
