
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('source/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}


export default gulp.series(
  styles, server, watcher
);


gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
  .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
  return gulp.src("build/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp.src("build/img/sprite-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest("build"));
});

gulp.task("js", function () {
  return gulp.src("source/js/*.js")
  .pipe(jsmin())
  .pipe(rename({suffix: ".min"}))
  .pipe(gulp.dest("build/js"));
});

gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("source/img/sprite-*.svg").on("change", gulp.series("sprite", "html"));
  gulp.watch("source/js/*.js").on("change", gulp.series("js", "refresh"));
  gulp.watch("source/*.html").on("change", gulp.series("html", "refresh"));
});

gulp.task("build", gulp.series("clean", "copy", "images", "webp", "css", "js", "sprite", "html"));
gulp.task("start", gulp.series("build", "server"));


// Подключение Gulp и плагинов
const cssnano = require("gulp-cssnano");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");

// Определяем задачи
// Компилируем Sass в CSS, добавляем префиксы, минимизируем и объединяем CSS файлы
gulp.task("styles", () => {
  return gulp
    .src("src/scss/**/*.scss") // Исходные файлы
    .pipe(sass()) // Компилируем Sass в CSS
    .pipe(autoprefixer()) // Добавляем префиксы
    .pipe(cssnano()) // Минимизируем CSS
    .pipe(concat("styles.min.css")) // Объединяем в один файл
    .pipe(gulp.dest("dist/css")); // Папка назначения
});

// Минимизируем и объединяем JavaScript файлы
gulp.task("scripts", () => {
  return gulp
    .src("src/js/**/*.js") // Исходные файлы
    .pipe(uglify()) // Минимизируем JavaScript
    .pipe(concat("scripts.min.js")) // Объединяем в один файл
    .pipe(gulp.dest("dist/js")); // Папка назначения
});

// Оптимизируем изображения
gulp.task("images", () => {
  return gulp
    .src("src/images/**/*") // Исходные файлы
    .pipe(imagemin()) // Оптимизируем изображения
    .pipe(gulp.dest("dist/images")); // Папка назначения
});

// Следим за изменениями в исходных файлах и запускаем соответствующие задачи
gulp.task("watch", () => {
  gulp.watch("src/scss/**/*.scss", gulp.series("styles")); // Отслеживаем Sass файлы
  gulp.watch("src/js/**/*.js", gulp.series("scripts")); // Отслеживаем JavaScript файлы
  gulp.watch("src/images/**/*", gulp.series("images")); // Отслеживаем файлы изображений
});

// Задача по умолчанию для запуска при вводе «gulp» в терминале
gulp.task("default", gulp.series("styles", "scripts", "images", "watch"));
