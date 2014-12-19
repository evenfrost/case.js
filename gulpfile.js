var gulp = require('gulp'),
    changed = require('gulp-changed'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    nodemon = require('gulp-nodemon'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    runSequence = require('run-sequence'),
    del = require('del'),

    stylesAssetsPath = 'client/styles/**/*.styl',
    stylesPublicPath = 'public/styles',
    scriptsAssetsPath = 'client/scripts/**/*.js',
    scriptsPublicPath = 'public/scripts';

/**
 * Styles.
 */
gulp.task('styles', function () {
  return gulp.src(stylesAssetsPath)
    .pipe(plumber())
    .pipe(changed(stylesPublicPath))
    .pipe(stylus({
      use: [nib()],
      import: ['nib']
    }))
    .pipe(gulp.dest(stylesPublicPath))
    .pipe(livereload());
});

/**
 * Scripts.
 */
gulp.task('scripts', function () {
  return gulp.src(scriptsAssetsPath)
    .pipe(plumber())
    .pipe(changed(scriptsPublicPath))
    .pipe(gulp.dest(scriptsPublicPath))
    .pipe(livereload());
});

/**
 * Watchers.
 */
gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(stylesAssetsPath, ['styles']);
  gulp.watch(scriptsAssetsPath, ['scripts']);
}); 

/**
 * Cleaners.
 */
gulp.task('clean', function (cb) {
  del([
    scriptsPublicPath,
    stylesPublicPath
  ], cb);
});

/**
 * Development helpers.
 */
gulp.task('dev', function () {
  nodemon({
    script: 'bin/www',
    ext: 'js jade',
    ignore: ['client/**', 'public/**']
  })
    .on('start', ['watch'])
    .on('change', ['watch']);
});

/**
 * Default task.
 */
gulp.task('default', function (callback) {
  runSequence('clean', ['styles', 'scripts'], 'dev', callback);
});
