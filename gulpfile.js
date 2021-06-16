const gulp = require("gulp");
const replace = require("gulp-replace");
const del = require("del");
const tap = require("gulp-tap");
const inject = require("gulp-inject");

const paths = {
  html: {
    src: "src/**/*.html",
    dest: "dist/",
  },
  styles: {
    src: "src/**/*.css",
    dest: "dist/",
  },
  js: {
    src: "src/**/*.js",
    dest: "dist/",
  },
};

const clean = () => {
  return del(["dist"]);
};

const buildStyles = () => {
  return gulp.src(paths.styles.src).pipe(gulp.dest(paths.styles.dest));
};

const buildHtml = () => {
  return gulp
    .src("src/sheet.html")
    .pipe(
      inject(gulp.src(["src/skills.js"]), {
        starttag: "// SKILLS",
        endtag: "// END SKILLS",
        transform: function (filepath, file) {
          return file.contents.toString();
        },
      })
    )
    .pipe(
      inject(gulp.src(["src/attributes.js"]), {
        starttag: "// ATTRIBUTES",
        endtag: "// END ATTRIBUTES",
        transform: function (filepath, file) {
          return file.contents.toString();
        },
      })
    )
    .pipe(
      inject(gulp.src(["src/definitions.js"]), {
        starttag: "// DEFINITIONS",
        endtag: "// END DEFINITIONS",
        transform: function (filepath, file) {
          return file.contents.toString();
        },
      })
    )
    .pipe(
      inject(gulp.src(["src/combat.js"]), {
        starttag: "// COMBAT",
        endtag: "// END COMBAT",
        transform: function (filepath, file) {
          return file.contents.toString();
        },
      })
    )
    .pipe(
      inject(gulp.src(["src/utils.js"]), {
        starttag: "// UTILS",
        endtag: "// END UTILS",
        transform: function (filepath, file) {
          return file.contents.toString();
        },
      })
    )
    .pipe(
      inject(gulp.src(["src/magic_psionics.js"]), {
        starttag: "// MAGIC_PSIONICS",
        endtag: "// END MAGIC_PSIONICS",
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
  gulp.watch(paths.js.src, build);
};

exports.watch = watch;
exports.build = build;
exports.default = build;
