// notes:
// Help and Login divs don't do anything yet
// Placeholder images
// Request access button doesn't do anything

// require dependencies
var html = require('choo/html')
var css = require('sheetify')

// require modules
var navbar = require('../navbar')
var api = require('../../../lib/ccsapi')

// export module
module.exports = function (state, emit) {
  var style = css`
    :host {
      #content {
        display: flex;
        flex-direction: row;
        justify-content: center;
        max-width: 1100px;
        margin: auto;
        #content-left {
          margin: 3rem 0 0 1rem;
          width: 50%;
          #features {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            .feature {
              font-size: 0.75rem;
              font-weight: bold;
              margin-right: 1rem;
              width: 33%;
              .placeholder {
                background-color: #d7d7d7;
                height: 5rem;
                width: 100%
              }
            }
          }
          #contact {
            font-size: 0.75rem;
            width: 60%;
            a, a:visited {
              color: #498fe1;
              font-weight: bold;
              text-decoration: none;
            }
          }
        }
        #content-right {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-left: 1rem;
          width: 50%;
          #create-account {
            border: 1px solid black;
            padding: 1rem 2rem;
            input {  width: 100%;  }
            p {
              font-size: 0.75rem;
              font-weight: bold;
              margin-bottom: 0.5rem;
            }
            select {  width: 100%;  }
            #name-input {
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              div:first-child {  margin-right: 1rem;  }
              div {  width: 50%;  }
            }
            #multiple-locations {
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              margin-top: 1rem;
              img {  height: 1rem;  }
              p {
                font-weight: normal;
                margin: 0 0 0 0.5rem;
              }
            }
            #error {
              background-color: #d7d7d7;
              font-size: 0.8rem;
              margin-top: 1rem;
              padding: 1rem 0.5rem;
              text-align: center;
            }
            #button-container {
              display: flex;
              flex-direction: row;
              justify-content: flex-end;
              margin-top: 1rem;
            }
          }
        }
      }
    }
  `
  var homeState = state.ccs.ui.home
  var username = homeState.username
  var givenName = homeState.givenName
  var lastName = homeState.lastName
  var email = homeState.email
  var location = homeState.location
  var error = homeState.error
  var loaded = state.ccs.static.locations.length ? true : false

  return html`
    <div class=${style} onload=${emit('loadStatic')}>
      ${navbar()}
      ${loaded ? html`
        <div id="content">
          <div id="content-left">
            <h1>Communicate with your clients</h1>
            <p>Another line summarising the benefits of <strong>Orion for CCS staff.</strong></p>
            <div id="features">
              <div class="feature">
                <div class="placeholder"></div>
                <p>Easily schedule reminders for supervision appointments in advance.</p>
              </div>
              <div class="feature">
                <div class="placeholder"></div>
                <p>Set up community work reminders to be sent automatically.</p>
              </div>
              <div class="feature">
                <div class="placeholder"></div>
                <p>Communicate with clients via SMS or web app.</p>
              </div>
            </div>
            <h2>How can I get access?</h2>
            <p>
              If you have a:<br />
              - login to eJustice, and <br />
              - a justice.vic.gov.au email address <br />
              we can set you up with an account.
            </p>
            <p id="contact">You can also contact <a href="/ccs/administrators">the administrator</a> for your office directly. They'll be the one who sets up your account.</p>
          </div>
          <div id="content-right">
            <h2>Get started - Create an account</h2>
            <div id="create-account">
              <p>Your eJustice username</p>
              <input type="text" id="username" value=${username} oninput=${updateInput} required />
              <div id="name-input">
                <div>
                  <p>Your given name</p>
                  <input type="text" id="givenName" value=${givenName} oninput=${updateInput} required />
                </div>
                <div>
                  <p>Your family name</p>
                  <input type="text" id="lastName" value=${lastName} oninput=${updateInput} />
                </div>
              </div>
              <p>Your work email address</p>
              <input type="text" id="email" value=${email} oninput=${updateInput} placeholder="Use your justice.vic.gov.au email address" required />
              <p>Your office</p>
              ${printLocations()}
              <div id="multiple-locations">
                <img src="../../assets/information.png" />
                <p> If you work in more than one office in a region, just choose one.</p>
              </div>
              ${error ? displayError() : null}
              <div id="button-container">
                <button class="white-button" onclick=${validateInput}>
                Request access
                </button>
              </div>
            </div>
          </div>
        </div>
      ` : null}
    </div>
  `

  function displayError() {
    return html`
      <div id="error">
        ${error}
      </div>
    `
  }

  function updateInput (e) {
    emit('updateInput', {user: 'ccs', template: 'home', target: e.target.id, text: e.target.value})
  }

  function validateInput () {
    var errorMessage = ''

    if (!givenName) {
      errorMessage = 'Please enter your given name'
    } else if (!email.endsWith('@justice.vic.gov.au')) {
      errorMessage = 'Please try again using your @justice.vic.gov.au email address'
    } else if (!location) {
      errorMessage = 'Please select a location'
    }

    if (errorMessage) {
      emit('updateError', {template: 'home', error: errorMessage})
    } else {
      validateUser(email)
    }
  }

  function validateUser () {
    api.findUser(function (data) {
      if (data !== null) {
        emit('updateError', {template: 'home', error: 'Another user with this username already exists'})
      } else {
        api.newUser(function (data) {
          if (data === 1) {
            emit('updateError', {template: 'home', error: `We've sent a request to your local administrator. Keep an eye out for an email.`})
          } else {
            emit('updateError', {template: 'home', error: 'Whoops, looks like there was a problem!'})
          }
        }, {
          Username: username,
          Password: 'initpasswd',
          email: email,
          Role: 'Staff',
          Location: state.ccs.static.locations.filter(function (obj) {
            return obj.SiteName === location})[0].LocationID,
          FirstName: givenName,
          LastName: lastName,
          Authentication: 0
        })
      }}, {Username: username})
  }

  function printLocations() {
    return html`
      <select name="location" id="location" onchange=${updateInput} required>
        <option disabled ${homeState.location ? null : 'selected'} value></option>
        ${state.ccs.static.locations.map(function (el) {
          return html`
            <option value="${el.SiteName}" ${state.ccs.ui.home.location === el.SiteName ? 'selected' : null}>${el.SiteName}</option>
          `
        })}
      </select>
    `
  }
}
