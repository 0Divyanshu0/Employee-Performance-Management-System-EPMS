import React from "react";
import "./Button.css"; // Import the CSS file

function Button({
    children,
    onClick,
    size = "md",
    color = "primary",
    className = "",
    icon, // 1. Accept the icon prop
    type = "button"
}) {
    // The component will now construct a single class name based on its props
    // and append any extra `className` provided.
    const buttonClass = `button-component button--${color}-${size}`;

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${buttonClass} ${className}`}
        >
            <span className="btn-icon">{icon}</span>
            {children}
        </button>
    );
}


export default Button;