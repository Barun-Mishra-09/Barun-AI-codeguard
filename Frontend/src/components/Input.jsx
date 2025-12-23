export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      className={`w-full h-11 rounded-lg bg-transparent border outline-none
        appearance-none
        text-base
        leading-normal
        pl-2 pr-7
        indent-6
        ${className}`}
    />
  );
}
