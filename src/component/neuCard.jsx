import React from "react";

export default function NeumorphicCard({
  children,
  className = "",
  as: Component = "div",
  padding = "p-8",
  rounded = "rounded-[2rem]",
}) {
  return (
    <Component
      className={`relative bg-base-100 ${rounded} ${padding} w-full shadow-neo ${className}`}
    >
      {children}
    </Component>
  );
}
