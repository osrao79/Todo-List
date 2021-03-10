import React, { useState } from "react";
import "./LoginForm.css";

export default function LoginForm(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-container">
      <input
        type="text"
        placeholder="Username"
        className="username"
        onChange={(evt) => {
          setUsername(evt.target.value);
        }}
      ></input>
      <input
        type="password"
        placeholder="Password"
        className="password"
        onChange={(evt) => {
          setPassword(evt.target.value);
        }}
      ></input>
      {props.error ? <div className="error">{props.error}</div> : null}
      <button
        className="signup"
        onClick={() => {
          props.signupHandler(username, password);
        }}
      >
        Sign Up
      </button>
      <button
        className="login"
        onClick={() => {
          props.loginHandler(username, password);
        }}
      >
        Log In
      </button>
    </div>
  );
}
