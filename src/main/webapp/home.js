{ // avoid variables ending up in the global scope

	// page components
	let conferencesList, conferencesList2, usersList, wizard, wizardUsers,
		pageOrchestrator = new PageOrchestrator(); // main controller
	let usersToShow;

	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null) {
			window.location.href = "index.html";
		} else {
			pageOrchestrator.start(); // initialize the components
			pageOrchestrator.refresh();
		} // display initial content
	}, false);


	// Constructors of view components

	function PersonalMessage(_username, messagecontainer) {
		this.username = _username;
		this.show = function() {
			messagecontainer.textContent = "Nice to see you again " + this.username;
		}

		this.reset = function() {
			messagecontainer.style.visibility = "hidden";
		}
	}

	function ConferencesList(_alert, _listcontainer, _listcontainerbody) {
		this.alert = _alert;
		this.listcontainer = _listcontainer;
		this.listcontainerbody = _listcontainerbody;

		this.reset = function() {
			this.listcontainer.style.visibility = "hidden";
		}

		this.show = function(next) {
			let self = this;
			makeCall("GET", "getConferences", null,
				function(req) {
					if (req.readyState === 4) {
						let message = req.responseText;
						if (req.status === 200) {
							let conferencesToShow = JSON.parse(req.responseText);
							if (conferencesToShow.length === 0) {
								self.alert.textContent = "No conferences yet!";
								return;
							}
							self.update(conferencesToShow); // self visible by closure
							if (next) next(); // show the default element of the list if present

						} else if (req.status === 403) {
							window.location.href = req.getResponseHeader("Location");
							window.sessionStorage.removeItem('username');
						}
						else {
							self.alert.textContent = message;
						}}
				}
			);
		};


		this.update = function(arrayConferences) {
			let row, cell;
			this.listcontainerbody.innerHTML = ""; // empty the table body
			// build updated list
			let self = this;
			arrayConferences.forEach(function(conference) { // self visible here, not this
				row = document.createElement("tr");
				cell = document.createElement("td");
				cell.textContent = conference.title;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.textContent = conference.date;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.textContent = conference.duration;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.textContent = conference.guests;
				row.appendChild(cell);
				self.listcontainerbody.appendChild(row);
			});
			this.listcontainer.style.visibility = "visible";

		}
	}

	function ConferencesList2(_alert, _listcontainer, _listcontainerbody) {
		this.alert = _alert;
		this.listcontainer = _listcontainer;
		this.listcontainerbody = _listcontainerbody;

		this.reset = function() {
			this.listcontainer.style.visibility = "hidden";
		}

		this.show = function(next) {
			let self = this;
			makeCall("GET", "getConferences2", null,
				function(req) {
					if (req.readyState === 4) {
						let message = req.responseText;
						if (req.status === 200) {
							let conferencesToShow = JSON.parse(req.responseText);
							if (conferencesToShow.length === 0) {
								self.alert.textContent = "No conferences yet!";
								return;
							}
							self.update(conferencesToShow); // self visible by closure
							if (next) next(); // show the default element of the list if present

						} else if (req.status === 403) {
							window.location.href = req.getResponseHeader("Location");
							window.sessionStorage.removeItem('username');
						}
						else {
							self.alert.textContent = message;
						}}
				}
			);
		};


		this.update = function(arrayConferences) {
			let row, cell;
			this.listcontainerbody.innerHTML = ""; // empty the table body
			// build updated list
			let self = this;
			arrayConferences.forEach(function(conference) { // self visible here, not this
				row = document.createElement("tr");
				cell = document.createElement("td");
				cell.textContent = conference.title;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.textContent = conference.date;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.textContent = conference.duration;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.textContent = conference.guests;
				row.appendChild(cell);
				self.listcontainerbody.appendChild(row);
			});
			this.listcontainer.style.visibility = "visible";

		}
	}

	function UserList(_alert, _listcontainer, _listcontainerbody) {
		this.alert = _alert;
		this.listcontainer = _listcontainer;
		this.listcontainerbody = _listcontainerbody;

		this.reset = function() {
			this.listcontainer.style.visibility = "hidden";
		}

		this.show = function(next) {
			let self = this;
			self.update(usersToShow); // self visible by closure
			if (next) next(); // show the default element of the list if present
		};


		this.update = function(arrayUsers) {
			let row, cell, checkbox;
			this.listcontainerbody.innerHTML = ""; // empty the table body
			// build updated list
			let self = this;

			arrayUsers.forEach(function(user) { // self visible here, not this
				row = document.createElement("tr");
				cell = document.createElement("td");
				checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.name = "userscheckbox";
				checkbox.value = user.id;
				if(user.checked)
					checkbox.checked = true;
				cell.appendChild(checkbox);
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.textContent = user.name;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.textContent = user.surname;
				row.appendChild(cell);
				self.listcontainerbody.appendChild(row);
			});

			this.listcontainer.style.visibility = "visible";
		}
	}


	function Wizard(wizardId, alert) {
		// minimum date the user can choose, in this case now and in the future
		let now = new Date(),
			formattedDate = now.toISOString().substring(0, 10);
		this.wizard = wizardId;
		this.alert = alert;

		this.wizard.querySelector('input[type="date"]').setAttribute("min", formattedDate);

		this.registerEvents = function(orchestrator) {

			// Manage submit button
			this.wizard.querySelector("input[type='button'].submit").addEventListener('click', (e) => {
				let eventfieldset = e.target.closest("form"),
					valid = true;
				for (let i = 0; i < eventfieldset.elements.length; i++) {
					if (!eventfieldset.elements[i].checkValidity()) {
						eventfieldset.elements[i].reportValidity();
						valid = false;
						break;
					}
				}
				if (valid) {
					let self = this;
					makeCall("POST", 'CreateConference', e.target.closest("form"),
						function(req) {
							if (req.readyState === XMLHttpRequest.DONE) {
								let message = req.responseText; // error message or conference id
								if (req.status === 200) {
									usersToShow = JSON.parse(req.responseText);
									if (usersToShow.length === 0) {
										self.alert.textContent = "No users yet!";
									}
									orchestrator.refresh("w"); // id of the new conference passed
								} else if (req.status === 403) {
									window.location.href = req.getResponseHeader("Location");
									window.sessionStorage.removeItem('username');
								}
								else {
									self.alert.textContent = message;
									self.reset();
								}
							}
						}
					);
				}
			});
		};
	}

	function WizardUsers(wizardId, userList, alert) {

		this.wizard = wizardId;
		this.alert = alert;


		this.registerEvents = function(orchestrator) {

			// Manage submit button
			this.wizard.querySelector("input[type='button'].submit").addEventListener('click', (e) => {
				let eventfieldset = e.target.closest("form"),
					valid = true;
				for (let i = 0; i < eventfieldset.elements.length; i++) {
					if (!eventfieldset.elements[i].checkValidity()) {
						eventfieldset.elements[i].reportValidity();
						valid = false;
						break;
					}
				}
				if (valid) {
					let self = this;
					makeCall("POST", 'CheckBoxUsers', e.target.closest("form"),
						function(req) {
							if (req.readyState === XMLHttpRequest.DONE) {
								let message = req.responseText; // error message or conference id
								if (req.status === 201) { //created
									orchestrator.refresh(); // id of the new conference passed
								} else if (req.status === 100) { // riprova
									usersToShow = JSON.parse(req.responseText);
									if (usersToShow.length === 0) {
										self.alert.textContent = "No users yet!";
									}
									orchestrator.refresh("w");
								} else if (req.status === 205) { // troppi tentativi
									window.location.href = "/WEB_INF/Cancellazione.html";
								} else if (req.status === 403) {
									window.location.href = req.getResponseHeader("Location");
									window.sessionStorage.removeItem('username');
								}
								else {
									self.alert.textContent = message;
									self.reset();
								}
							}
						}
					);
				}
			});
		};
	}

	function PageOrchestrator() {
		let alertContainer = document.getElementById("id_alert");

		this.start = function() {
			personalMessage = new PersonalMessage(sessionStorage.getItem('username'),
				document.getElementById("id_username"));
			personalMessage.show();


			conferencesList = new ConferencesList(
				alertContainer,
				document.getElementById("id_listcontainer"),
				document.getElementById("id_listcontainerbody"));

			conferencesList2 = new ConferencesList2(
				alertContainer,
				document.getElementById("id_listcontainer2"),
				document.getElementById("id_listcontainerbody2"));

			usersList = new UserList(
				alertContainer,
				document.getElementById("id_listcontainer3"),
				document.getElementById("id_listcontainerbody3"));


			wizard = new Wizard(document.getElementById("id_createconferenceform"), alertContainer);
			wizard.registerEvents(this);  // the orchestrator passes itself --this-- so that the wizard can call its refresh function after creating a conference

			wizardUsers = new WizardUsers(document.getElementById("id_usersform"), usersList, alertContainer);
			wizardUsers.registerEvents(this);


			document.querySelector("a[href='Logout']").addEventListener('click', () => {
				window.sessionStorage.removeItem('username');
			})
		};

		this.refresh = function(message) { // currentConference initially null at start
			alertContainer.textContent = "";// not null after creation of status change
			if(message == null){
				document.getElementById("modalbackground").style.visibility = "hidden";
				conferencesList.reset();
				conferencesList2.reset();
				usersList.reset();
				conferencesList.show(); // closure preserves visibility of this
				conferencesList2.show();
			} else if(message === "w"){
				document.getElementById("modalbackground").style.visibility = "visible";
				usersList.reset();
				usersList.show();
			}
		};
	}
}
