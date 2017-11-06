// require dependencies
var choo = require('choo')
var reload = require('choo-reload')
var css = require('sheetify')

// initialise app
var app = choo()
app.use(reload())

// declare state
app.use(require('./state'))

// import stylesheets
css('./assets/normalize.css')

// declare routes
app.route('/', require('./templates/home'))
app.route('/administrators', require('./templates/administrators'))
app.route('/admin/manageusers', require('./templates/admin/manageusers'))
app.route('/admin/adduser', require('./templates/admin/adduser'))
app.route('/admin/edituser', require('./templates/admin/edituser'))
app.route('/setreminder', require('./templates/setreminder'))
app.route('/offendersearch', require('./templates/offendersearch'))

// start app
if (typeof window !== 'undefined') {
  document.body.appendChild(app.start())
}
