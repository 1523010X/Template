const {src, dest, series, watch} = require('gulp');
const pug = require('gulp-pug');
const htmlFormat = require('gulp-format-html');
const htmlBem = require('gulp-html-bem-validator');
const woff2 = require('gulp-ttftowoff2');
const cache = require('gulp-cache');
const stylus = require('gulp-stylus');
const browserSync = require('browser-sync').create();
const cssMediaGroup = require('gulp-group-css-media-queries');
const cssComb = require('gulp-csscomb');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const notify = require('gulp-notify');
const jsLint = require('gulp-eslint');
const concat = require('gulp-concat');
const svgSprite = require('gulp-svg-sprite');
const pugLint = require('gulp-pug-linter');
const imageMin = require('gulp-imagemin');
const del = require('del');

const clean = () => {
  return del(['dev', 'dist']);
};

const buildFonts = () => {
  return src('source/fonts/**/*.ttf')
      .pipe(cache(woff2()))
      .pipe(dest('dev/fonts'))
      .pipe(dest('dist/fonts'))
      .pipe(browserSync.stream());
};

const buildFiles = () => {
  return src('source/files/**/*')
      .pipe(dest('dev/files'))
      .pipe(dest('dist/files'))
      .pipe(browserSync.stream());
};

const buildLib = () => {
  return src('source/lib/**/*')
      .pipe(dest('dev/lib'))
      .pipe(dest('dist/lib'))
      .pipe(browserSync.stream());
};

const pugLinter = () => {
  return src('source/html/**/*.pug')
      .pipe(pugLint({reporter: 'default', failAfterError: true}));
};

const buildHTML = () => {
  return src('source/html/*.pug')
      .pipe(pug())
      .pipe(dest('dist'))
      .pipe(htmlFormat())
      .pipe(htmlBem())
      .pipe(dest('dev'))
      .pipe(browserSync.stream());
};

const buildCSS = () => {
  return src('source/css/style.styl')
      .pipe(stylus())
      .pipe(autoprefixer({cascade: false}))
      .pipe(cleanCSS({level: 2}))
      .pipe(cssMediaGroup())
      .pipe(cssComb())
      .pipe(dest('dev/css'))
      .pipe(dest('dist/css'))
      .pipe(cleanCSS({level: 2}))
      .pipe(rename({suffix: '.min'}))
      .pipe(dest('dev/css'))
      .pipe(dest('dist/css'));
};

const buildJS = () => {
  return src('source/js/*.js')
      .pipe(jsLint())
      .pipe(jsLint.format())
      .pipe(jsLint.failAfterError())
      .pipe(concat('script.js'))
      .pipe(dest('dev/js'))
      .pipe(dest('dist/js'))
      .pipe(babel({
        presets: ['@babel/env'],
      }))
      .pipe(uglify().on('error', notify.onError()))
      .pipe(rename({suffix: '.min'}))
      .pipe(dest('dev/js'))
      .pipe(dest('dist/js'))
      .pipe(browserSync.stream());
};

const buildIMG = () => {
  return src('source/img/**/*.{jpg,jpeg,png,svg,ico}')
      .pipe(cache(imageMin()))
      .pipe(dest('dev/img'))
      .pipe(dest('dist/img'))
      .pipe(browserSync.stream());
};

const buildSVG = () => {
  return src('source/img/icons/*.svg')
      .pipe(svgSprite({
        shape: {
          transform: [{
            'svgo': {
              'plugins': [
                {removeAttrs: {attrs: '(fill|style)'}},
              ],
            },
          }],
        },
        mode: {
          stack: {
            sprite: '../sprite.svg',
          },
        },
      }))
      .pipe(dest('dev/img'))
      .pipe(dest('dist/img'))
      .pipe(browserSync.stream());
};

const buildServer = () => {
  browserSync.init({
    server: {
      baseDir: 'dev',
    },
  });
};

const watchClean = () => {
  return del([
    'dev/img/icons/*',
    'dist/img/icons/*',
    'dev/assets/*',
    'dist/assets/*',
    'dev/lib/**/*',
    'dist/lib/*',
    'dev/fonts/*',
    'dist/fonts/*',
  ],
  );
};

const watchImg = () => {
  return del([
    'dev/img/**/*',
    'dist/img/**/*',
  ],
  );
};

const watchIcons = () => {
  return del([
    'dev/img/icons/*',
    'dist/img/icons/*',
  ],
  );
};

watch('source/fonts/**/*.ttf', series(watchClean, buildFonts));
watch('source/html/**/*.pug', buildHTML);
watch('source/css/**/*.styl', buildCSS);
watch('source/js/**/*.js', buildJS);
watch('source/img/*.{jpg,png,svg,jpeg,ico}', series(watchImg, buildIMG));
watch('source/img/icons/*.svg', series(watchIcons, buildIMG, buildSVG));
watch('source/assets/**/*', series(watchClean, buildFiles));
watch('source/lib/**/*', series(watchClean, buildLib));

exports.del = clean;
exports.fonts = buildFonts;
exports.lib = buildLib;
exports.html = buildHTML;
exports.css = buildCSS;
exports.js = buildJS;
exports.img = buildIMG;
exports.svg = buildSVG;

exports.build = series(clean, buildFonts, buildLib, pugLinter, buildHTML, buildCSS, buildJS, buildIMG, buildSVG);
exports.start = series(clean, buildFonts, buildLib, pugLinter, buildHTML, buildCSS, buildJS, buildIMG, buildSVG, buildServer);
