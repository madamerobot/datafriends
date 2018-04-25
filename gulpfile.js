const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const babel = require('gulp-babel')
const browserify = require('browserify')
const gulpUtil = require('gulp-util')
const sass = require('gulp-sass')
const watchify = require('watchify')
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream')

const src = './public/src'
const dest = './public/dist'

gulp.task('watchStyles', () => {
  gulp.watch('public/src/styles/**/*.scss', () => {
    gulp.start('sass')
  })

  gulp.watch('./public/static/**', () => {
    gulp.dest('./public/dist/')
  })
})

gulp.task('watchJs', () => { 
  const b = watchify(browserify('./public/src/js/app.js', watchify.args))
    .transform('babelify', {
      presets: ['es2015'],
      ignore: /\/node_modules\/(?!app\/)/
    })

  b.on('update', rebundle)
  b.on('log', gulpUtil.log.bind(gulpUtil))

  function rebundle() {
    return b.bundle()
      .on('error', gulpUtil.log)
      .pipe(source('app.js'))
      .pipe(gulp.dest('./public/dist/js'))
  }

  return rebundle()
})

//Compiling scss files into css files
gulp.task('sass', () => {
  return gulp.src('./public/src/styles/app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/dist/css'))
})

gulp.task('static', () => {
  return gulp.src('./public/static/**')
    .pipe(gulp.dest('./public/dist/'))
})

//Compile ES6 js files into ES2015
gulp.task('browserify', () => {
  var b = browserify('./public/src/js/app.js', {
    debug: true
  }).transform('babelify', {
    presets: ['es2015'],
    ignore: /\/node_modules\/(?!app\/)/
  })

  b.on('log', function (msg) {
    console.log(msg)
  })

  return b.bundle()
    .on('error', gulpUtil.log)
    .pipe(source(src))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./public/dist/js'))
})

gulp.task('watch', ['watchStyles', 'watchJs'])
gulp.task('default', ['static', 'sass', 'browserify'])