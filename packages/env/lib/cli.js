'use strict';
/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const ora = require( 'ora' );
const yargs = require( 'yargs' );
const terminalLink = require( 'terminal-link' );

/**
 * Internal dependencies
 */
const env = require( './env' );

// Colors
const boldWhite = chalk.bold.white;
const wpPrimary = boldWhite.bgHex( '#00669b' );
const wpGreen = boldWhite.bgHex( '#4ab866' );
const wpRed = boldWhite.bgHex( '#d94f4f' );
const wpYellow = boldWhite.bgHex( '#f0b849' );

// Spinner
const withSpinner = ( command ) => ( ...args ) => {
	const spinner = ora().start();
	args[ 0 ].spinner = spinner;
	let time = process.hrtime();
	return command( ...args ).then(
		( message ) => {
			time = process.hrtime( time );
			spinner.succeed(
				`${ message || spinner.text } (in ${ time[ 0 ] }s ${ (
					time[ 1 ] / 1e6
				).toFixed( 0 ) }ms)`
			);
		},
		( error ) => {
			if ( error instanceof env.ValidationError ) {
				// Error is a validation error. That means the user did something wrong.
				spinner.fail( error.message );
				process.exit( 1 );
			} else if (
				'exitCode' in error &&
				'err' in error &&
				'out' in error
			) {
				// Error is a docker-compose error. That means something docker-related failed.
				// https://github.com/PDMLab/docker-compose/blob/master/src/index.ts
				spinner.fail( 'Error while running docker-compose command.' );
				if ( error.out ) {
					process.stdout.write( error.out );
				}
				if ( error.err ) {
					process.stderr.write( error.err );
				}
				process.exit( error.exitCode );
			} else {
				// Error is an unknown error. That means there was a bug in our code.
				spinner.fail( error.message );
				// Disable reason: Using console.error() means we get a stack trace.
				// eslint-disable-next-line no-console
				console.error( error );
				process.exit( 1 );
			}
		}
	);
};

module.exports = function cli() {
	yargs.usage( wpPrimary( '$0 <command>' ) );

	yargs.command(
		'start',
		wpGreen(
			chalk`Starts WordPress for development on port {bold.underline ${ terminalLink(
				'8888',
				'http://localhost:8888'
			) }} (override with WP_ENV_PORT) and tests on port {bold.underline ${ terminalLink(
				'8889',
				'http://localhost:8889'
			) }} (override with WP_ENV_TESTS_PORT). The current working directory must be a WordPress installation, a plugin, a theme, or contain a .wp-env.json file.`
		),
		() => {},
		withSpinner( env.start )
	);
	yargs.command(
		'stop',
		wpRed(
			'Stops running WordPress for development and tests and frees the ports.'
		),
		() => {},
		withSpinner( env.stop )
	);
	yargs.command(
		'clean [environment]',
		wpYellow( 'Cleans the WordPress databases.' ),
		( args ) => {
			args.positional( 'environment', {
				type: 'string',
				describe: "Which environments' databases to clean.",
				choices: [ 'all', 'development', 'tests' ],
				default: 'tests',
			} );
		},
		withSpinner( env.clean )
	);
	yargs.command(
		'run <container> [command..]',
		'Runs an arbitrary command in one of the underlying Docker containers.',
		( args ) => {
			args.positional( 'container', {
				type: 'string',
				describe: 'The container to run the command on.',
			} );
			args.positional( 'command', {
				type: 'string',
				describe: 'The command to run.',
			} );
		},
		withSpinner( env.run )
	);

	return yargs;
};
