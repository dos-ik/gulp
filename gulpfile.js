const gulp = require('gulp');

// css
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssdeclsort = require('css-declaration-sorter');
const gcmq = require('gulp-group-css-media-queries');

// html
const pug = require('gulp-pug');

// image
const imagemin = require("gulp-imagemin");
const imageminJpg = require("imagemin-mozjpeg");
const imageminPng = require("imagemin-pngquant");
const imageminGif = require("imagemin-gifsicle");

// utility
const notify = require('gulp-notify');	// 通知
const plumber = require("gulp-plumber");	// 監視継続


// path
var rootdir = './dest';
var destdir = rootdir;
var srcdir = {
  scss: ['./src/**/*.scss'],
  pug: ['./src/**/*.pug', '!src/**/_*.pug', '!./src/_*/**/*'],
  image: './src/**/*.+(jpg|jpeg|png|gif)',
  copy: ['./src/**/*', '!./src/**/*.+(pug|scss|jpg|jpeg|png|gif)']
}


//
// task
//

// sass
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
      browsers: ["last 2 versions", "ie >= 11", "Android >= 4"],
      cascade: false
    })
  ];

  return gulp
    .src(srcdir.scss, { sourcemaps: true, })
    // watchエラー監視継続+DP通知
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postcss(plugins))	// 設定したpost-cssを実行
    .pipe(gcmq())	// メディアクエリをまとめる
    .pipe(gulp.dest(destdir, { sourcemaps: './' }))	// ソースマップを生成してコンパイル
}

// pug
function html() {
  return gulp
    .src(srcdir.pug)
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
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
  return gulp
    .src(srcdir.image, { since: gulp.lastRun(images) })
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
  return gulp
    .src(srcdir.copy)
    .pipe(gulp.dest(destdir));
}

// 監視
function watch() {
  gulp.watch(srcdir.scss, styles);
  gulp.watch(srcdir.pug, html);
  gulp.watch(srcdir.copy, copy);
  gulp.watch(srcdir.image, images);
}

// 実行コマンド
exports.build = gulp.parallel(styles, html, images, copy);
exports.default = watch;
exports.watch = watch;
exports.styles = styles;
exports.html = html;
exports.images = images;
exports.copy = copy;

 // npm i -D gulp-sass gulp-postcss autoprefixer css-declaration-sorter gulp-group-css-media-queries gulp-pug gulp-plumber gulp-notify gulp-imagemin imagemin-mozjpeg imagemin-pngquant imagemin-gifsicle
