'use strict';

var gulp       = require('gulp');
var babel      = require('gulp-babel');
var browserify = require('browserify');
var concat     = require('gulp-concat');
var eslint     = require('gulp-eslint');
var karma      = require('karma');
var mocha      = require('gulp-mocha');
var rename     = require('gulp-rename');
var source     = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var through    = require('through2');
var uglify     = require('gulp-uglify');


function toStringModule() {
  return through.obj(function(file, enc, done) {
    if (file.isBuffer()) {
      var newContents = 'module.exports = ' + JSON.stringify(file.contents.toString(enc)) + ';';
      file.contents = new Buffer(newContents, enc);
    } else if (file.isStream()) {
      throw new Error('Streams are not yet supported.');
    }
    done(null, file);
  });
}


// Fix for gulp not terminating after mocha finishes
gulp.doneCallback = function (err) {
  process.exit(err ? 1 : 0);
};


gulp.task('lint', function() {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});


gulp.task('babel-lib', function() {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib/'));
});

gulp.task('babel-spec', function() {
  return gulp.src('test/spec-src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('test/spec'));
});


gulp.task('browser-slave-module', function() {
  return gulp.src('./src/worker.browser/slave.js.txt')
    .pipe(toStringModule())
    .pipe(rename('slave-code.js'))
    .pipe(gulp.dest('./lib/worker.browser/'));
});


gulp.task('browserify-lib', ['babel-lib', 'browser-slave-module'], function() {
  return browserify()
    .add('./lib/bundle.browser.js')
    .require('./lib/worker.browser/worker.js', { expose : './worker' })   // so the node worker won't make it's way into the bundle
    .bundle()
    .pipe(source('thread.browser.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('uglify', ['browserify-lib'], function() {
  return gulp.src('dist/thread.browser.js')
    .pipe(uglify())
    .pipe(concat('thread.browser.min.js'))
    .pipe(gulp.dest('dist/'));
});


gulp.task('test-browser', ['dist', 'babel-spec'], function(done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('test-node', ['dist', 'babel-spec'], function() {
  return gulp.src('test/spec/*.spec.js', { read: false })
    .pipe(mocha());
});


gulp.task('dist', ['lint', 'browserify-lib', 'uglify']);

gulp.task('default', ['dist', 'test-node', 'test-browser']);