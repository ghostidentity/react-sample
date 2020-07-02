// array in local storage for registered users
let users = JSON.parse(localStorage.getItem("users")) || [];

const axios = require("axios");

export function configureFakeBackend() {
  let realFetch = window.fetch;
  window.fetch = function (url, opts) {
    const { method, headers } = opts;
    const body = opts.body && JSON.parse(opts.body);

    return new Promise((resolve, reject) => {
      // wrap in timeout to simulate server api call
      setTimeout(handleRoute, 500);

      function handleRoute() {
        switch (true) {
          case url.endsWith("/users/authenticate") && method === "POST":
            return authenticate();
          case url.endsWith("/users/register") && method === "POST":
            return register();
          case url.endsWith("/users") && method === "GET":
            return getUsers();
          case url.match(/\/users\/\d+$/) && method === "DELETE":
            return deleteUser();
          default:
            // pass through any requests not handled above
            return realFetch(url, opts)
              .then((response) => resolve(response))
              .catch((error) => reject(error));
        }
      }

      // route functions

      function authenticate() {
        const { username, password } = body;
        const session_url = "http://localhost:8080/api/auth/signin";

        const headers = {
          "Content-Type": "application/json",
        };

        var data = {
          username: username,
          password: password,
        };

        let axiosConfig = {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },
        };

        axios
          .post(session_url, data, axiosConfig)
          .then((res) => {
            console.log("token1: " + JSON.stringify(res.data.accessToken));
            if (res.status == 200) {
              localStorage.setItem("token", res.data.accessToken);

              return ok({
                id: res.data.id,
                username: res.data.username,
                firstName: res.data.firstname,
                lastName: res.data.lastname,
                token: res.data.accessToken,
              });
            } else {
              return error("Username or password is incorrect");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }

      function register() {
        const user = body;

        console.log("Raw REgister" + JSON.stringify(user));

        var data = {
          username: user.username,
          password: user.password,
          firstname: user.firstName,
          lastname: user.lastName,
          email: user.email,
          roles: ["user"],
        };

        let axiosConfig = {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },
        };

        const session_url = "http://localhost:8080/api/auth/signup";

        axios
          .post(session_url, data, axiosConfig)
          .then((res) => {
            console.log("Result: " + JSON.stringify(res));
            if (res.status == 200) {
              return ok({
                id: res.data.id,
                username: res.data.username,
                firstName: res.data.firstname,
                lastName: res.data.lastname,
                token: res.data.accessToken,
              });
            } else {
              return error("Username or password is incorrect");
            }
          })
          .catch((err) => {
            console.log(err);
          });

        // assign user id and a few other properties then save
        // user.id = users.length ? Math.max(...users.map((x) => x.id)) + 1 : 1;
        // users.push(user);
        //localStorage.setItem("users", JSON.stringify(users));

        return ok();
      }

      function getUsers() {
        //   if (!isLoggedIn()) return unauthorized();

        const session_url = "http://localhost:8080/api/users/all";
        const token = localStorage.getItem("token");

        let axiosConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        axios
          .get(session_url, axiosConfig)
          .then((res) => {
            console.log(JSON.stringify(res));

            return ok(res.data);
          })
          .catch((err) => {
            console.log(err);
          });

        //return ok(users);
      }

      //TODO
      function deleteUser() {
        const session_url ="http://localhost:8080/api/users/delete/" + idFromUrl();
        const token = localStorage.getItem("token");

        console.log("URL" + session_url);

        let axiosConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        axios
          .get(session_url, axiosConfig)
          .then((res) => {
            return ok();
          })
          .catch((err) => {
            console.log(err);
          });
      }

      // helper functions

      function ok(body) {
        resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify(body)),
        });
      }

      function unauthorized() {
        resolve({
          status: 401,
          text: () =>
            Promise.resolve(JSON.stringify({ message: "Unauthorized" })),
        });
      }

      function error(message) {
        resolve({
          status: 400,
          text: () => Promise.resolve(JSON.stringify({ message })),
        });
      }

      function isLoggedIn() {
        return headers["Authorization"] === "Bearer fake-jwt-token";
      }

      function idFromUrl() {
        const urlParts = url.split("/");
        return parseInt(urlParts[urlParts.length - 1]);
      }
    });
  };
}
