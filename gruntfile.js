'use strict';

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-eslint');

	grunt.initConfig({
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					quiet: false,
					clearRequireCache: false
				},
				src: ['test/**/*.js']
			}
		},
		eslint: {
			options: {
				configFile: '.eslintrc'
			},
			target: ['test/*.js', 'bin/*.js', 'lib/*.js']
		}
	});

	grunt.registerTask('lint', ['eslint']);
	grunt.registerTask('test', ['mochaTest']);
	grunt.registerTask('default', []);
};