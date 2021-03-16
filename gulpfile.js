const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const { src, series, parallel, dest, watch } = require('gulp');

const htmlPath = 'src/*.html';
const cssPath = 'src/styles/**/*.scss';
const jsPath = 'src/scripts/**/*.js';

function taskHtml() {
  return src(htmlPath).pipe(gulp.dest('dist'));
}

function taskStyles() {
  return src(cssPath)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/styles'));
}

function taskScripts() {
  return src(jsPath)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(concat('app.js'))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/scripts'));
}

function taskAssets() {
  return src('src/assets/**/*').pipe(gulp.dest('dist'));
}

function browserSyncServe(cb) {
  browserSync.init({
    server: {
      baseDir: "dist/",
      index: "index.html",
    },
    port: 8080,
    open: false,
  });
  cb();
}

function browserSyncReload(cb) {
  browserSync.reload();
  cb();
}


function taskWatch() {
  watch(htmlPath, browserSyncReload);
  watch([cssPath, jsPath], { interval : 500}, parallel(taskStyles, taskScripts, browserSyncReload));
}

exports.taskHtml = taskHtml;
exports.taskStyles = taskStyles;
exports.taskScripts = taskScripts;
exports.taskAssets = taskAssets;
exports.browserSyncServe = browserSyncServe;

exports.default = series(
  parallel(taskHtml, taskStyles, taskScripts, taskAssets, browserSyncServe), taskWatch
);
