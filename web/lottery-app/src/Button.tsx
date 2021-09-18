export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<Props> = ({ children, ...props }) => {
  return (
    <button
      className="app__button"
      {...props}
    >
      {children}
    </button>
  )
}
