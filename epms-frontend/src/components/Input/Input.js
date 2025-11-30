import React from "react";
import "./Input.css"; // Import the CSS file

function Input({ id, type = "text", placeholder, register, name, required }) {
    return (
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            // Spread the registration properties if `register` is provided
            {...(register ? register(name, { required }) : {})} 
            // Apply the custom CSS class
            className="input-component"
        />
    );
}

export default Input;