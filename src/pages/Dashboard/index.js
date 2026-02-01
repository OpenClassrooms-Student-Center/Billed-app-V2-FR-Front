import { formatDate } from '../../app/format.js'
import DashboardFormUI from './DashboardFormUI.js'
import BigBilledIcon from '../../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../../constants/routes.js'
import USERS_TEST from '../../constants/usersTest.js'
import Logout from "../../components/Logout.js"

export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // in jest environment
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // in prod environment
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    if (!document) console.log('Dashboard constructor: document is MISSING')
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const arrowIcon1 = this.document.querySelector('#arrow-icon1')
    const arrowIcon2 = this.document.querySelector('#arrow-icon2')
    const arrowIcon3 = this.document.querySelector('#arrow-icon3')
    if (arrowIcon1) arrowIcon1.addEventListener('click', (e) => this.handleShowTickets(e, bills, 1))
    if (arrowIcon2) arrowIcon2.addEventListener('click', (e) => this.handleShowTickets(e, bills, 2))
    if (arrowIcon3) arrowIcon3.addEventListener('click', (e) => this.handleShowTickets(e, bills, 3))
    new Logout({ localStorage, onNavigate, document })
  }

  handleClickIconEye = () => {
    const billUrl = this.document.querySelector('#icon-eye-d').getAttribute("data-bill-url")
    const modale = this.document.querySelector('#modaleFileAdmin1')
    const modal = new bootstrap.Modal(modale)

    // Listen for modal shown event to calculate width after it's visible
    modale.addEventListener('shown.bs.modal', () => {
      const imgWidth = Math.floor(modale.getBoundingClientRect().width * 0.8)
      modale.querySelector(".modal-body").innerHTML = `<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`
    }, { once: true })

    modal.show()
  }

  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id
    if (this.counter % 2 === 0) {
      bills.forEach(b => {
        const el = this.document.querySelector(`#open-bill${b.id}`)
        if (el) el.style.background = '#0D5AE5'
      })
      const billEl = this.document.querySelector(`#open-bill${bill.id}`)
      if (billEl) billEl.style.background = '#2A2B35'
      this.document.querySelector('.dashboard-right-container div').innerHTML = DashboardFormUI(bill)
      this.document.querySelector('.vertical-navbar').style.height = '150vh'
      this.counter++
    } else {
      const billEl = this.document.querySelector(`#open-bill${bill.id}`)
      if (billEl) billEl.style.background = '#0D5AE5'

      this.document.querySelector('.dashboard-right-container div').innerHTML = `
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `
      this.document.querySelector('.vertical-navbar').style.height = '120vh'
      this.counter++
    }
    const iconEye = this.document.querySelector('#icon-eye-d')
    if (iconEye) iconEye.addEventListener('click', this.handleClickIconEye)
    const btnAccept = this.document.querySelector('#btn-accept-bill')
    if (btnAccept) btnAccept.addEventListener('click', (e) => this.handleAcceptSubmit(e, bill))
    const btnRefuse = this.document.querySelector('#btn-refuse-bill')
    if (btnRefuse) btnRefuse.addEventListener('click', (e) => this.handleRefuseSubmit(e, bill))
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: this.document.querySelector('#commentary2').value
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: this.document.querySelector('#commentary2').value
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleShowTickets(e, bills, index) {
    if (this.counter === undefined || this.index !== index) this.counter = 0
    if (this.index === undefined || this.index !== index) this.index = index
    if (this.counter % 2 === 0) {
      const arrow = this.document.querySelector(`#arrow-icon${this.index}`)
      if (arrow) arrow.style.transform = 'rotate(0deg)'
      this.document.querySelector(`#status-bills-container${this.index}`)
        .innerHTML = cards(filteredBills(bills, getStatus(this.index)))
      this.counter++
    } else {
      const arrow = this.document.querySelector(`#arrow-icon${this.index}`)
      if (arrow) arrow.style.transform = 'rotate(90deg)'
      this.document.querySelector(`#status-bills-container${this.index}`)
        .innerHTML = ""
      this.counter++
    }

    bills.forEach(bill => {
      const openBill = this.document.querySelector(`#open-bill${bill.id}`)
      if (openBill) openBill.addEventListener('click', (e) => this.handleEditTicket(e, bill, bills))
    })

    return bills

  }

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          const bills = snapshot
            .map(doc => ({
              id: doc.id,
              ...doc,
              date: doc.date,
              status: doc.status
            }))
          return bills
        })
        .catch(error => {
          throw error;
        })
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then(bill => bill)
        .catch(console.log)
    }
  }
}
