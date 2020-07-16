
const API = {
    getUsersAll: () => fetch('https://jsonplaceholder.typicode.com/users')
};


class User {
    constructor(list=[]) {
        this.list = list;
        this.isReqSucess = null;
        this.Error = null;
        this.isFetching = false ;
    }

    deleteUser(id) {
        for (let i = 0, length = this.list.length; i < length; i++) {
            if (this.list[i].id == id) {
                this.list.splice(i, 1);

                return this.render();
            }
        }
        return null;
    }

    addUser = (name, username, website, email) => {
        let id = this.list.length ? this.list[this.list.length - 1].id : 0
        let user = {
            id: ++id,
            name,
            username,
            email,
            website,
            phone: '',
            company: {
                name: '',
                catchPhrase: '',
                bs: ''
            },
            address: {
                street: '',
                suite: '',
                city: '',
                zipcode: '',
                geo: {
                    lat: '',
                    lng: ''
                }
            }
        }

        this.list.push(user)
        this.render()
    }

    sortUsers (column) {
        this.list.sort((prev, next) => 
            prev[column].toLowerCase() > next[column].toLowerCase() ? 1 : -1 
        ).reverse()
        this.render()

    }

    generateUserList = (list) => {
        const Fragment = document.createDocumentFragment()
        console.log(list)
    
        list.reverse().forEach((user) => {
             let tr = document.createElement('tr')
    
            tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td><a href="mailto:${user.email}">${user.email}</a></td>
            <td><a href="${user.website}">${user.website}</a></td>
            <td>
                <button data-action="DELETE_USER" data-id="${user.id}" aria-label="Delete user" title="Delete this user">
                    delete
                </button>
                <button data-action="SEE_INFO" data-id="${user.id}" aria-label="See detailed information" title="See detailed information about this user">
                    more...
                </button>
            </td>
             `
            Fragment.appendChild(tr)
         })
      
    return Fragment
    }

    render() {
        const getElementTable = document.querySelector('.users-table__list')
        getElementTable.innerHTML= '';

        const layout = this.isFetching ? (
            `<tr>
                <td class="exception">
                <td class="exception">loading</td>
                     <img src="" alt="Loading">
                </td>
            </tr>`
        ) : (
            this.isReqSuccess ? (
                this.list.length == 0 ? (
                    `<tr>
                        <td class="exception">The user list is empty.</td>
                    </tr>`
                ) : this.generateUserList(this.list)
            ) : (
                `<tr>
                    <td class="exception error">${this.Error}</td>
                </tr>`
            )
        );

        return this.list.length ? 
        getElementTable.appendChild(layout) : 
        getElementTable.insertAdjacentHTML('afterbegin', layout)

    }
}



class Form {
    constructor(addUser) {
        this.wrapper = document.querySelector('.wrapper')
        this.formAddUserWrapper = null
        this.listUser = null
        this.addUser = addUser

        this.init()
    }

    submitForm = (e) =>{ 
        e.preventDefault()
        const data = new FormData(e.target)
        console.log(data)

        this.addUser(
            data.get("name"),
            data.get("username"),
            data.get("email"),
            data.get("website"),
        )
    }

    init = () => {
        const formLayout = `
            <form class="form-add-user" id="formAddUser">
                <input type="text" name="name" placeholder="Name" required>
                <input type="text" name="username" placeholder="Username" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="text" name="website" placeholder="Website" required>
                <button id="addNewUserBtn" class="form-add-user_btn">Add new user</button>
            </form>
        `;

        this.wrapper.insertAdjacentHTML("afterbegin", formLayout)
        this.formAddUserWrapper = document.querySelector('.form-add-user')
        this.formAddUserWrapper.addEventListener("submit", this.submitForm )
    }
}


class Popup {
    constructor() {
        this.init();

        this.popupBg = document.querySelector('.popup-bg');
        this.btnClose = document.getElementById('closePopupBtn');
        this.listInfo = document.querySelector('.popup__list-info');

        this.btnClose.addEventListener('click', this.closePopup.bind(this));
    }

    init() {
        const layout = `
            <div class="popup-bg">
                <div class="popup-wrap">
                    <button class="popup__btn-close" id="closePopupBtn">
                    close
                    </button>
                    <dl class="popup__list-info">
                    </dl>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', layout);
    }

    show(info) {
        this.popupBg.style.display = 'flex';
        this.render(info);
    }

    closePopup() {
        this.popupBg.style.display = 'none';
    }

    render(info) {
        this.listInfo.innerHTML = `
            <dt>Name:</dt>
                <dd>${info.name ? info.name : 'Неизвестно'}</dd>
            <dt>Username</dt>
                <dd>${info.username ? info.username : 'Неизвестно'}</dd>
            <dt>Address:</dt>
                <dd>
                    Street ${info.address.street ? info.address.street : 'Неизвестно'},
                    suite ${info.address.street ? info.address.street : 'Неизвестно'},
                    city ${info.address.city ? info.address.city : 'Неизвестно'},
                    zip-code: ${info.address.zipcode ? info.address.zipcode : 'Неизвестно'}.</dd>
            <dt>Company:</dt>
                <dd>
                    ${info.company.name ? info.company.name : 'Неизвестно'},
                    ${info.company.catchPhrase ? info.company.catchPhrase : 'Неизвестно'}
                </dd>
        `;
    }
}

const getUsers =  async(users, formAddUser) => {
    users.isFetching = true
    users.render()

    try{
        const response = await API.getUsersAll()
        const result = await response.json()
        console.log(result)

        users.isReqSuccess = true
        users.list = result
        formAddUser.listUsers = users.list
    }catch (e){
        users.isReqSuccess = false;
        users.Error = e.message;
        console.error('Error:', e);

    }
    finally {
        // загрузка закончилась
        users.isFetching = false;
        // если данные очень быстро загрузились
        // то, чтобы прелоужер быстро не пропадал, что не красиво,
        // ставимзадержку на 250 миллисекунд
        setTimeout(() => users.render(), 500);
    }
}

const initApp = () => {
    const users = new User()
    const popup = new Popup()
    const formAddUser = new Form(users.addUser)

    window.users = users;

    getUsers(users, formAddUser)


  // с помощью делегирования события ловим клик по определенной кнопке
    document.getElementById('userTable')
        .addEventListener('click', e => {
            const { action, id = null } = e.target.dataset;

            switch(action) {
                case 'DELETE_USER':
                    return users.deleteUser(id);

                case 'SEE_INFO':
                    return popup.show(users.list.find(user => user.id == id));

                case 'SORT_BY_NAME':
                    return users.sortUsers('name');

                case 'SORT_BY_USERNAME':
                    return users.sortUsers('username');

                case 'SORT_BY_EMAIL':
                    return users.sortUsers('email');

                case 'SORT_BY_WEBSITE':
                    return users.sortUsers('website');

                default:
                    return false;
            }
        });
}

document.addEventListener('DOMContentLoaded', initApp);