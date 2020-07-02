import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
const axios = require("axios");
import { userActions } from '../_actions';

function HomePage() {
    const users = useSelector(state => state.users);
    const user = useSelector(state => state.authentication.user);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(userActions.getAll());
    }, []);

    function handleDeleteUser(id) {
        //dispatch(userActions.delete(id));

        const session_url ="http://localhost:8080/api/users/delete/" +id;
        const token = localStorage.getItem("token");

        console.log("URL" + session_url);

        let axiosConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        axios
          .delete(session_url, axiosConfig)
          .then((res) => {
            return ok();
          })
          .catch((err) => {
            console.log(err);
          });
    }

    function handleEdit(id,first, last) {
        dispatch(userActions.edit(id, first, last));
    }

    return (
        <div className="col-lg-8 offset-lg-2">
            <h1>Hi {user.firstName}!</h1>
            <p>You are authenticated</p>
            <h3>All registered users:</h3>
            {users.loading && <em>Loading users...</em>}
            {users.error && <span className="text-danger">ERROR: {users.error}</span>}
            {users.items &&
                <ul>
                    {users.items.map((user, index) =>
                        <li key={user.id}>
                            {user.firstname + ' ' + user.lastname}
                            {
                                user.deleting ? <em> - Deleting...</em>
                                : user.deleteError ? <span className="text-danger"> - ERROR: {user.deleteError}</span>
                                : <span> - <a onClick={() => handleDeleteUser(user.id)} className="text-primary">Delete</a>
                                  </span>
                            }
                        </li>
                    )}
                </ul>
            }
            <p>
                <Link to="/login">Logout</Link>
            </p>
        </div>
    );
}

export { HomePage };