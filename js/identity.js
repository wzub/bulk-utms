const login_container = document.querySelector("#login_container"),
	utm_container = document.querySelector("#utm_container"),
	utm_form = document.querySelector("#utm_form"),
	name_container = document.querySelector("#name_container"),
	hours = new Date().getHours();

let logged_in = false,
	token = "";

// just some fun
if (hours <= 6) greeting = "Burning the midnight oil huh";
else if (hours < 12) greeting = "Good morning";
else if (hours == 12) greeting = "It's almost lunchtime";
else if (hours > 12 && hours < 17) greeting = "Good afternoon";
else greeting = "Good evening";

// trigger login modal if not logged in
netlifyIdentity.on("init", (user) => {
	if (!user) {
		netlifyIdentity.open();
	}
});

netlifyIdentity.on("login", (user) => {
	console.log("login as", user);

	if (user) {
		const name = user.user_metadata.full_name;
			token = user.token.access_token;

		name_container.textContent = `${greeting}, ${name}!`;

		login_container.classList.add("visually-hidden");
		utm_container.classList.remove("visually-hidden");
		logged_in = true;
		utm_form.reset;
	}
});

netlifyIdentity.on("logout", () => {
	console.log("logged out");

	name_container.textContent =
		login_container.classList.remove("visually-hidden");
	utm_container.classList.add("visually-hidden");
	logged_in = false;
	token = "";
	utm_form.reset;
});

netlifyIdentity.on("error", (err) => console.error("Error", err));