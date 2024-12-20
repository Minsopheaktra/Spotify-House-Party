import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password })
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login")
            }
        } catch (error) {
            console.log(error);
            if (method === "login") {
                alert("Login failed. Please check your credentials and try again.");
            } else {
                alert("Registration failed. Please try again or use a different username.");
            }
        } finally {
            setLoading(false)
        }
    };

    const renderRegisterButton = () => {
        if (method === "login") {
            return (
                <>
                    <p>Not yet a member?</p>
                    <button className="form-button" onClick={() => navigate("/register")}>
                        Register
                    </button>
                </>
            )
        }
    }
    
    const renderLoginButton = () => {
        if (method === "register") {
            return (
                <>
                    <p>Already a member?</p>
                    <button className="form-button" onClick={() => navigate("/login")}>Login</button>
                </>
            )
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
            {renderRegisterButton()}
            {renderLoginButton()}
        </form>
    );
}

export default Form