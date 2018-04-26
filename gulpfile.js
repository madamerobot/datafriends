// Declarations and dependencies 
// ----------------------------------------------------------------------------
const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const gutil = require('gulp-util')
const babelify = require('babelify')
const nodemon = require('gulp-nodemon')

// Gulp tasks
// ----------------------------------------------------------------------------
gulp.task('compile', () => {
  bundleApp()
})

gulp.task('start', () => {
  nodemon({
    script: 'server.js'
    , ext: 'js html'
    , env: { 'NODE_ENV': 'development' }
  })
})

gulp.task('watch', () => {
  gulp.watch(['./public/src/js/*.js'])
})

// When running 'gulp' as a command from Terminal, this task will fire
// It will start watching for changes in every .js file
// If there is a change, the task 'scripts' defined above will fire
gulp.task('default', ['start', 'compile', 'watch'])

// Private Functions
// ----------------------------------------------------------------------------
function bundleApp () {
  // Browserify will bundle all our js files together in to one and will let us use
  // modules in the front end
  const appBundler = browserify({
    entries: './public/src/js/index.js',
    debug: true
  })

  appBundler
    // Transform ES6 and JSX to ES5 with babelify
    .transform('babelify', { presets: ['es2015', 'react'] })
    .bundle()
    .on('error', gutil.log)
    .pipe(source('index.js'))
    .pipe(gulp.dest('./public/dist/js/'))
}