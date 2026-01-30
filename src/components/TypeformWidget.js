"use client";
import { useEffect } from "react";

export default function TypeformWidget({ user, onSubmit }) {
  useEffect(() => {
    // Handle form submission message
    const handleMessage = (event) => {
      // Check for form-submit event from Typeform
      if (event.data?.type === "form-submit") {
        if (onSubmit) onSubmit();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onSubmit]);

  const hiddenFields = user 
    ? `email=${encodeURIComponent(user.email)},user_id=${encodeURIComponent(user.id)}`
    : "";

  return (
    <div className="w-full h-full relative z-0">
      <div
        data-tf-live="01KFAXJF0FWVK8GDW7MF8ZKPP7"
        data-tf-hidden={hiddenFields}
        style={{ width: "100%", height: "100%" }}
      ></div>
    </div>
  );
}
