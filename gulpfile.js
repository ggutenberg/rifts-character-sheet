const gulp = require("gulp");
const replace = require("gulp-replace");
const del = require("del");
const tap = require("gulp-tap");
const inject = require("gulp-inject");

const paths = {
  html: {
    src: "src/**/*.html",
    dest: "Megaverse-2.0/",
  },
  styles: {
    src: "src/**/*.css",
    dest: "Megaverse-2.0/",
  },
  js: {
    src: "src/**/*.js",
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
    .src("src/palladium_megaverse.html")
    .pipe(
      inject(gulp.src(["src/skills.js"]), {
        starttag: "// Skills",
        endtag: "// End Skills",
        transform: function (filepath, file) {
          return file.contents.toString();
        },
      })
    )
    .pipe(replace(/text\/javascript/g, "text/worker"))
    .pipe(gulp.dest(paths.html.dest));
};

exports.js = () =>
  gulp
    .src("src/palladium_megaverse.html")
    .pipe(
      inject(gulp.src(["src/skills.js"]), {
        starttag: "// Skills",
        endtag: "// End Skills",
        transform: function (filepath, file) {
          return file.contents.toString();
        },
      })
    )
    .pipe(gulp.dest(paths.html.dest));

const build = gulp.series(clean, buildHtml, buildStyles);

const watch = () => {
  gulp.watch(paths.html.src, build);
  gulp.watch(paths.styles.src, build);
};

exports.watch = watch;
exports.build = build;
exports.default = build;
