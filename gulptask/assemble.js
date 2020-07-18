const gulp = require('gulp')
const htmlmin = require('gulp-htmlmin')
const less = require('gulp-less')
const cssmin = require('gulp-cssmin')
const rename = require('gulp-rename')
const extname = require('gulp-extname')
const plumber = require('gulp-plumber')
const yaml = require('js-yaml')
const assemble = require('assemble')
const fs = require('fs')
let pageData = yaml.safeLoad(fs.readFileSync("./src/data/data.yml", 'utf-8'))
const app = assemble()

app.helper('each_upto', function (ary, max, options) {
    if (!ary || ary.length === 0)
        return options.inverse(this);

    let result = [];
    for (let i = 0; i < max && i < ary.length; ++i)
        result.push(options.fn(ary[i]));
    return result.join('');
});

gulp.task('load', function (done) {
    app.partials('src/partials/*.hbs')
    app.layouts('src/layouts/common.hbs')
    app.pages('src/doc/**/*.hbs')
    done()
})

gulp.task('less', function (done) {
    gulp.src('src/asset/css/less/*.less')
        .pipe(less())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('src/asset/css/'))
    done();
});

gulp.task('assemble', gulp.series('less', gulp.parallel('load'), function () {
    return app.toStream('pages')
        .pipe(plumber())
        .pipe(app.renderFile({layout: 'common', page: pageData}))
        .pipe(htmlmin({collapseWhitespace: true, minifyJS: true, removeComments: true}))
        .pipe(rename({basename: 'index'}))
        .pipe(extname('.html'))
        .pipe(app.dest('dist/'))
}))
