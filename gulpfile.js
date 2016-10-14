
/****** 
** load plugins 
******/

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
		runSequence = require('run-sequence'), 
		autoprefixer = require('gulp-autoprefixer'), 
		sourcemaps = require('gulp-sourcemaps'), 
		eslint = require('gulp-eslint'),
		pug = require('gulp-pug'), 
		data = require('gulp-data')
;



/****** 
** Primary Tasks
******/

// serve dev site
gulp.task('serve', function(){

	runSequence(['sass', 'scripts', 'browserSync', 'watch']);

});


// build production site
gulp.task('build', function(){

	console.log('building dist');

	// Note -- runsequence runs tasks separated by comma one-by-one, tasks in [] will be run at the same time
	runSequence('clean', 'sass',['useref', 'images', 'fonts', 'extras']);

});



/****** 
** asset tasks 
******/

// styles
gulp.task('sass', function(){

	return gulp.src('app/assets/scss/**/*.+(scss|sass)')

		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers:['last 2 versions']
		}))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest('.tmp/styles'))
		.pipe(browserSync.reload({
			stream: 	true
		}));

});

// grab js files, sourcemap them, output to tmp directory
gulp.task('scripts', ['lint'], function(){

	return gulp.src('app/assets/scripts/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('.tmp/scripts'))
		.pipe(browserSync.reload({
			stream: 	true
		}));

});
// Lint JS files with ESLINT
gulp.task('lint', function(){

	return gulp.src(['**/*.js', '!node_modules/**'])
		.pipe(eslint({
			configFile:'config/eslint.json'
		}))
		.pipe(eslint.format())
});

/****** 
** view tasks 
******/

gulp.task('pug', function(){
	gulp.src('app/views/**/*.pug')
		.pipe(data(function(){
			// add data via json file
			// TODO -- ensure the below works, I'm winging it here. 
			return require('data/**/*.json');
		}))
		.pipe(pug({}))
		.pipe(gulp.dest('.tmp/'));
});

// 
// 
// NOTE -- useref gets views from .tmp for build
// 
// 


/****** 
** server tasks 
******/

// configure watch task
gulp.task('watch', function(){
	gulp.watch('app/assets/scss/**/*.scss', ['sass']);
	gulp.watch('app/**/*.html', browserSync.reload);
	gulp.watch('app/assets/scripts/**/*.js', ['scripts']);
});

// setup browser-sync server
gulp.task('browserSync', function(){

	browserSync.init({
		port: 9000,
		server: {
			baseDir: ['.tmp','app']
		},
	})

});


/****** 
** Build Tasks 
******/

// useref combines assets into a single file after piping through minifiers based on file extension
gulp.task('useref', function(){

	return gulp.src('.tmp/*.html')
		.pipe(useref({
				searchPath:['.tmp', 'app']
			}))
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'));

});

// copies fonts folder
gulp.task('fonts', function() {
	return gulp.src('app/assets/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

})

// imagemin processes image files
gulp.task('images', function(){
	
	return gulp.src('app/assets/images/**/*.+(png|jpg|jpeg|giv|svg)')
		.pipe(cache(imagemin({
				// gif options
				interlaced: true,
				optimizationLevel: 2,
				// jpg options
				progressive: true
			})))
		.pipe(gulp.dest('dist/images'));

});

// extras (favicon, robots.txt, other root-level html files, etc)
gulp.task('extras', function() {
	return gulp.src([
		'app/*.*',
		'!app/*.html'
	], {
		dot: true
	}).pipe(gulp.dest('dist'));
});


// clean dist folder
gulp.task('clean:dist', function(){

	return del.sync('dist');

});
// delete locally cached images
gulp.task('clean:cache', function () {

	return cache.clearAll()

});
// generic clean task
gulp.task('clean', function() {
		
		runSequence('clean:dist', 'clean:cache')

});

