const gulp = require("gulp");
const replace = require("gulp-replace");
const del = require("del");

const paths = {
  html: {
    src: "src/**/*.html",
    dest: "Megaverse-2.0/",
  },
  styles: {
    src: "src/**/*.css",
    dest: "Megaverse-2.0/",
  },
};

const clean = () => {
  return del(["Megaverse-2.0"]);
};

const buildStyles = () => {
  return gulp.src(paths.styles.src).pipe(gulp.dest(paths.styles.dest));
};

const buildHtml = () => {
  return gulp
    .src(paths.html.src)
    .pipe(replace(/text\/javascript/g, "text/worker"))
    .pipe(gulp.dest(paths.html.dest));
};

const build = gulp.series(clean, buildHtml, buildStyles);

const watch = () => {
  gulp.watch(paths.html.src, build);
  gulp.watch(paths.styles.src, build);
};

exports.watch = watch;
exports.build = build;
exports.default = build;
