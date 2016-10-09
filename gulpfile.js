var gulp = require('gulp'), 
		sass = require('gulp-sass'), 
		browserSync = require('browser-sync').create(), 
		useref = require('gulp-useref'), 
		uglify = require('gulp-uglify'), 
		gulpIf = require('gulp-if'), 
		cssnano = require('gulp-cssnano'),
		imagemin = require('gulp-imagemin'), 
		cache = require('gulp-cache'), 
		del = require('del'), 
		runSequence = require('run-sequence')
		;

// compile scss files and pipe to css folder
gulp.task('sass', function(){

	return gulp.src('app/assets/scss/**/*.+(scss|sass)')
		.pipe(sass())
		.pipe(gulp.dest('app/assets/css'))
		.pipe(browserSync.reload({
			stream: true
		}));

});


// configure watch task
gulp.task('watch', ['browserSync', 'sass'], function(){

	gulp.watch('app/assets/scss/**/*.scss', ['sass']);

	gulp.watch('app/**/*.html', browserSync.reload);

	gulp.watch('app/assets/scripts/**/*.js', browserSync.reload);

});


// setup browser-sync server
gulp.task('browserSync', function(){

	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})

});

// useref combines assets into a single file after piping through minifiers based on file extension
gulp.task('useref', function(){

	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'));

});

// copies fonts folder -- uncomment if serving custom fonts, and add to build task below
// gulp.task('fonts', function() {

//   return gulp.src('app/assets/fonts/**/*')
//   	.pipe(gulp.dest('dist/fonts'));

// })

// imagemin processes image files
gulp.task('images', function(){
	
	return gulp.src('app/assets/images/**/*.+(png|jpg|jpeg|giv|svg)')
		.pipe(cache(imagemin({
				interlaced: true
			})))
		.pipe(gulp.dest('dist/images'));

});

// clean dist folder
gulp.task('clean:dist', function(){

	return del.sync('dist');

});

// delete locally cached images
gulp.task('cache:clear', function (callback) {

	return cache.clearAll(callback)

});


// serve dev site
gulp.task('serve', function(callback){

	runSequence(['sass', 'browserSync', 'watch'], callback);

});


// build production site
gulp.task('build', function(){

	console.log('building files');

	// Note -- runsequence runs tasks separated by comma one-by-one, tasks in [] will be run at the same time
	runSequence('clean:dist', 'sass', ['useref', 'images'], callback);

});


