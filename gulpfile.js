/*====================================
package
 ====================================*/
const gulp = require('gulp');
const sass = require('gulp-sass');  // scssコンパイル
const postcss = require('gulp-postcss');  // postcss本体
const autoprefixer = require('autoprefixer'); // postcssの一部
const mqpacker = require('css-mqpacker'); // postcssの一部
const cssdeclsort = require('css-declaration-sorter');  // postcssの一部(並び替え)
const pug = require('gulp-pug');
const plumber = require("gulp-plumber");  // 監視継続
const notify = require('gulp-notify');  // 通知
const imagemin = require("gulp-imagemin"); // 画像圧縮
const imageminJpg = require("imagemin-mozjpeg");
const imageminPng = require("imagemin-pngquant");
const imageminGif = require("imagemin-gifsicle");

/*==================================
 config
 ==================================*/
// path 設定
var rootdir = './dest';
var destdir = rootdir;
var srcdir = {
  scss: './src/**/*.scss',
  pug: ['./src/**/*.pug', '!src/**/_*.pug', '!./src/_*/**/*'],
  image: './src/**/*.+(jpg|jpeg|png|gif)',
  copy: ['./src/**/*', '!./src/**/*.+(pug|scss|jpg|jpeg|png|gif)']
}


/*==================================
task
==================================*/

// sass コンパイル
function styles() {

  // post-css プラグインの設定
  var plugins = [
    cssdeclsort({
      // smacss 沿ってソート
      order: 'smacss'
    }),
    autoprefixer({
      // IEは11以上、Androidは4.4以上
      // その他は最新2バージョンで必要なベンダープレフィックスを付与する設定
      browsers: ['ie >= 10', 'Android >= 4'],
      cascade: false
    }),
    // media-query をまとめる
    mqpacker()
  ];

  return gulp.src(srcdir.scss)
    // return gulp.src(srcdir.scss, { sourcemaps: true })
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))  // watch エラー監視継続+DP通知
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postcss(plugins)) // 設定したpost-cssを実行
    .pipe(gulp.dest(destdir))
  // .pipe(gulp.dest(destdir,{ sourcemaps: './' }))
}

// pug コンパイル
function html() {
  return gulp.src(srcdir.pug)
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))  // watch エラー監視継続+DP通知
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(destdir))

  /**
   * # 課題
   * gulp-dataの活用
   * 外部ファイルの活用
   */
}


// 画像圧縮
function images() {
  return gulp.src(srcdir.image, { since: gulp.lastRun(images) })
    .pipe(imagemin([
      imageminPng(),
      imageminJpg({
        quality: 85,
        progressive: true
      }),
      imageminGif({
        interlaced: false,
        optimizationLevel: 3,
        colors: 180
      })
    ]
    ))
    .pipe(gulp.dest(destdir))
}

// ファイルコピー
function copy() {
  return gulp.src(srcdir.copy)
    .pipe(gulp.dest(destdir));
}

function watch() {
  gulp.watch(srcdir.scss, styles);
  gulp.watch(srcdir.pug, html);
  gulp.watch(srcdir.copy, copy);
  gulp.watch(srcdir.image, images);
}

exports.build = gulp.parallel(styles, html, images, copy);
exports.default = watch;
exports.watch = watch;
exports.styles = styles;
exports.html = html;
exports.images = images;
exports.copy = copy;

