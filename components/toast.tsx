"use client";

interface ToastProps {
  message: string;
  type: "error" | "success";
  visible: boolean;
}

export function Toast({ message, type, visible }: ToastProps) {
  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                  px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg
                  transition-opacity duration-300
                  ${type === "error"
                    ? "bg-danger text-white"
                    : "bg-moss text-white"
                  }`}
    >
      {message}
    </div>
  );
}