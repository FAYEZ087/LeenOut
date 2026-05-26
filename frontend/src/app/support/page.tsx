"use client";

import React from "react";

export default function SupportPage() {
  return (
    <div className="w-full min-h-screen bg-bg flex flex-col overflow-hidden">
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSepo6Be0xm7Mw1es7tyZUUEbgJWp1UF2U4pNYwuBIlM7OMJbQ/viewform?embedded=true"
        width="100%"
        height="100vh"
        style={{ height: "100vh", border: "0" }}
        className="w-full flex-grow bg-bg"
        title="Leenout Support Form"
      />
    </div>
  );
}
