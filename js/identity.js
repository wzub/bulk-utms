const login_container = document.getElementById("login_container"),
    utm_container = document.getElementById("utm_container");

let logged_in = false;

netlifyIdentity.on('init', user => console.log('init', user));

netlifyIdentity.on("login", (user) => {
    console.log("login", user);

    if (user) {
        login_container.classList.add("visually-hidden");
        utm_container.classList.remove("visually-hidden");
        logged_in = true;
    }
});

netlifyIdentity.on('logout', () => {
    console.log("logged out");

    login_container.classList.remove("visually-hidden");
    utm_container.classList.add("visually-hidden");
    logged_in = false;
});


netlifyIdentity.on('error', err => console.error('Error', err));
netlifyIdentity.on('open', () => console.log('Widget opened'));
netlifyIdentity.on('close', () => console.log('Widget closed'));