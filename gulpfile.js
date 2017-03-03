"use strict";
const gulp = require("gulp");
const concat = require("gulp-concat");
const del = require("del");
const eslint = require("gulp-eslint");
const fs = require("fs");
/* default task work flow
*
*   lint:public
*   clean:public
*   build:mainjs
*   build:scripts
*   build:styles
*   build:maincss
*/
gulp.task("lint:public", () => {
    return gulp.src("src/scripts")
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
gulp.task("clean:public", ["lint:public"], () => {
    return del([
    "public/scripts/**/*",
    "public/css/**/*"
    ]);
});
gulp.task("build:mainjs", ["clean:public"], () => {
    return gulp.src([
        "src/distribution",
        "bower_components/jquery/dist/jquery.min.js",
        "bower_components/bootstrap/dist/js/bootstrap.min.js"
    ])
        .pipe(concat("main.js"))
        .pipe(gulp.dest("public/scripts/"));
});
// build loose scripts for distribution
gulp.task("build:scripts", ["clean:public"], () => {
    let scripts = fs.readdirSync("src/scripts");
    let concatScripts = (script) => {
        return gulp.src([
            "src/distribution",
            "src/scripts/" + script,
        ])
        .pipe(concat(script))
        .pipe(gulp.dest("public/scripts/"));
    }
    // check if file (exclude directories)
    for (let script of scripts) {
        var target = fs.statSync( __dirname + "\\src\\scripts\\" + script );
        if ( target.isFile() ) {
            concatScripts(script);
        }
    }
});
// concats app specific scripts by subdir
gulp.task("build:apps", ["clean:public"], () => {
    let concatApp = (app, src) => {
        let scripts = fs.readdirSync(src);
        let concatScripts = (scripts, src) => {
            let newArray = [];
            for (let i = 0; i < scripts.length; i++) {
                newArray.push( src + "\\" + scripts[i] );
            }
            return newArray;
        }
        return gulp.src( concatScripts(scripts, src) )
            .pipe(concat(app + ".js"))
            .pipe(gulp.dest("public\\scripts"));
    }
    // specify apps to concatenate scripts for
    concatApp("piata", "src\\scripts\\piata");
});
gulp.task("build:maincss", ["clean:public"], () => {
    return gulp.src([
        "src/distribution",
        "bower_components/bootstrap/dist/css/bootstrap.min.css"
    ])
        .pipe(concat("main.css"))
        .pipe(gulp.dest("public/css"));
});
gulp.task("build:styles", ["clean:public"], () => {
   let styles = fs.readdirSync("src/styles");
   let concatStyles = (style) => {
        return gulp.src([
            "src/distribution",
            "src/styles/" + style
        ])
        .pipe(concat(style))
        .pipe(gulp.dest("public/css"));
   }
   for (let style of styles) {
       concatStyles(style);
   }
});
gulp.task("copy:bs.css.map", ["build:styles"], () => {
    return gulp.src([
        "node_modules/bootstrap/dist/css/bootstrap.min.css.map"
    ])
        .pipe(gulp.dest("public/styles"));
})
// meta tasks
gulp.task("default", [
    "lint:public",
    "clean:public",
    "build:mainjs",
    "build:maincss",
    "build:scripts",
    "build:apps",
    "build:styles",
    "copy:bs.css.map"
]);