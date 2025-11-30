import React from "react";
import "./Label.css"; // Import the CSS file

function Label({ text, htmlFor }) {
    return (
        <label
            htmlFor={htmlFor}
            // Apply the custom CSS class instead of the utility classes
            className="label-component" 
        >
            {text}
        </label>
    );
}

export default Label;