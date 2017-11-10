// notes:
// sorted by first character of array
// go over styling
// will need pagination
// will all locations/regions be the same? need that sorting capability?
// question: what behaviour do numeric labels have when sorting?

// require dependencies
var html = require('choo/html')
var css = require('sheetify')

// require modules
var navbar = require('../../navbar/admin.js')

// export module
module.exports = function (state, emit) {
  var style = css`
    :host {
      #content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        margin: auto;
        margin-top: 6rem;
        margin-bottom: 6rem;
        max-width: 1100px;
        table {
          align-self: center;
          border-collapse: collapse;
          border: 1px #e5e5e5 solid;
          font-size: 0.9rem;
          width: 100%;
          img {
            height: 1rem;
            margin: auto;
            margin-left: 1rem;
          }
          th {
            background-color: #f8f8f8;
            border-top: 1px #e5e5e5 solid;
            border-bottom: 1px #e5e5e5 solid;
            color: #616069;
            padding: 0.25rem 1rem;
            text-align: left;
            span {
              cursor: pointer;
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              img {
                height: 1rem;
                margin: auto;
                margin-left: 1rem;
              }
            }
          }
          #new {
            td {
              background-color: #f8f8f8;
              color: #616069;
            }
          }
          td {
            border-bottom: 1px #e5e5e5 solid;
            padding: 0.25rem 1rem;
            a, a:visited {
              color: #498fe1;
              text-decoration: none;
            }
            span {
              background-color: #ffa200;
              border-radius: 10px;
              color: #fff;
              margin-right: 0.5rem;
              padding: 0.25rem 0.5rem;
            }
          }
          .manage-cell {
            border-left: 1px #e5e5e5 solid;
            display: flex;
            flex-direction: row;
            justify-content: center;
          }
        }
      }
    }
  `

  return html`
    <div class=${style} onload=${state.ui.manageUsers.loaded ? null : emit('loadUsers')}>
      ${navbar(state.user.name, state.ui.manageUsers.newRequests.length)}
      <div id="content">
        <h1>Manage CCS staff accounts</h1>
        <p>Case Managers, Justice Officers, Community Work Officers, and any other CCS staff who need to send SMS/web reminders to clients.</p>
        <button class="blue-button" style="align-self:flex-end" onclick=${addUser}>Add new user</button>
        ${generateTable()}
      </div>
    </div>
  `

  function generateTable() {
    var category = state.ui.manageUsers.sort.on
    var sortedNewRequests = state.ui.manageUsers.newRequests

    sortedNewRequests = sortedNewRequests.sort(function (a, b) {
      a = a[category].toLowerCase()
      b = b[category].toLowerCase()

      comparison = (a > b) - (a < b)
      return (state.ui.manageUsers.sort.direction === 'asc' ? comparison : (-comparison))
    })

    var sortedUsers = state.ui.manageUsers.users.sort(function (a, b) {
      a = a[category].toLowerCase()
      b = b[category].toLowerCase()
      comparison = (a > b) - (a < b)
      return (state.ui.manageUsers.sort.direction === 'asc' ? comparison : (-comparison))
    })

    return html`
      <table>
        <thead>
          <tr>
            ${state.ui.manageUsers.tableFields.map(function (el, index) {
              if (index < (state.ui.manageUsers.tableFields.length - 1)) {
                return html`
                  <th>
                    <span id="${el}" onclick=${updateSortCategory}>
                      ${el.charAt(0).toUpperCase() + el.slice(1)}
                      ${category === el ? html`<img src="../../assets/sort-${state.ui.manageUsers.sort.direction}.png" />` :
                                        html`<img src="../../assets/sort-arrows.png" />`}
                    </span>
                  </th>
                `
              } else {
                return html`
                  <th>${el.charAt(0).toUpperCase() + el.slice(1)}</th>
                `
              }
            })}
          </tr>
        </thead>
        <tbody>
          ${sortedNewRequests.map(function (el, index) {
            return html`<tr id="new"><td><span>${index + 1}</span>${el.name}</td><td>${el.email}</td><td>${el.location}</td><td>${el.region}</td><td>${el.role}</td><td class="manage-cell"><button class="blue-button" id="newUser-${index}" onclick=${newUser}>Requested Access</button></td></tr>`
          })}
          ${sortedUsers.map(function (el, index) {
            return html`<tr><td>${el.name}</td><td>${el.email}</td><td>${el.location}</td><td>${el.region}</td><td>${el.role.charAt(0).toUpperCase() + el.role.slice(1)}</td><td class="manage-cell"><button class="white-button" id="user-${index}" onclick=${editUser}>Edit</button></td></tr>`
          })}
        </tbody>
      </table>
    `
  }

  function editUser (e) {
    index = e.target.id.slice(5)
    emit('editUser', {index: index})
  }

  function newUser (e) {
    index = e.target.id.slice(8)
    emit('updateNewUser', {index: index})
  }

  function addUser () {
    emit('addNewUser')
  }

  function updateSortCategory (e) {
    if (e.target.id === state.ui.manageUsers.sort.on) {
      emit('reverseSort', {template: 'manageUsers'})
    } else {
      emit('updateSort', {template: 'manageUsers', target: e.target.id})
    }
  }
}
