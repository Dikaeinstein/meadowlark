module.exports = function(grunt) {
    // load grunt plugins
    [
        'grunt-contrib-jshint', 
        'grunt-cafe-mocha',
        'grunt-exec'
    ].forEach(function (npmTask) {
        grunt.loadNpmTasks(npmTask);
    });

    // configure plugins
    grunt.initConfig({
        jshint: {
            app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'],
            qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
            options: {
                node: true,
                esversion: 6
            }
        },
        cafemocha: {
            src: 'qa/tests-*.js',
            options: {
                ui: 'tdd'
            }
        },
        exec: {
            linkchecker: {
                cmd: 'linkchecker http://localhost:3000'
            }
        } 
    });

    // register tasks
    grunt.registerTask('default', ['jshint', 'cafemocha', 'exec']);
};