import {useRef, useEffect} from 'react'; 
// Importing useRef and useEffect hooks from React. useRef allows creating a reference to the input element, and useEffect lets us trigger side effects.
import {Form, type FormProps} from '@remix-run/react'; 
// Importing Form and the type FormProps from Remix for handling form submissions and typing the form props.

type SearchFormProps = Omit<FormProps, 'children'> & {
  // Defining a custom type `SearchFormProps` for the component props. It extends the default FormProps but excludes the 'children' prop.
  
  children: (args: {
    inputRef: React.RefObject<HTMLInputElement>; // Defines that the children function will receive an inputRef to manage the focus.
  }) => React.ReactNode; // The children function returns a React element.
};

/**
 * SearchForm is a reusable component that renders a form for performing search queries.
 * The form sends a GET request to the `/search` route, and it allows for an input field to be dynamically managed through a ref.
 * It also listens for a specific key combination (cmd+k) to auto-focus the search input field.
 * 
 * @example
 * ```tsx
 * <SearchForm>
 *  {({inputRef}) => (
 *    <>
 *      <input
 *        ref={inputRef}
 *        type="search"
 *        defaultValue={term}
 *        name="q"
 *        placeholder="Search…"
 *      />
 *      <button type="submit">Search</button>
 *   </>
 *  )}
 *  </SearchForm>
 * ```
 */
export function SearchForm({children, ...props}: SearchFormProps) {
  // The SearchForm component accepts children (a function) and other props (spread using ...props).
  
  const inputRef = useRef<HTMLInputElement | null>(null);
  // useRef creates a reference to the search input element, allowing us to focus or blur it.

  useFocusOnCmdK(inputRef);
  // Call a custom hook to focus the input when cmd+k is pressed.

  if (typeof children !== 'function') {
    return null; 
    // If children is not a function, return null. The children must be a function to receive the inputRef.
  }

  return (
    <Form method="get" {...props}>
      {/* Render the Form element with a GET method and pass any additional props. */}
      {children({inputRef})}
      {/* Call the children function and pass the inputRef to it. This lets the children manage the input field. */}
    </Form>
  );
}

/**
 * useFocusOnCmdK is a custom hook that adds an event listener for keyboard shortcuts.
 * When the user presses cmd+k (meta+k), the search input will automatically gain focus.
 * It also removes the focus (blurs) when the Escape key is pressed.
 */
function useFocusOnCmdK(inputRef: React.RefObject<HTMLInputElement>) {
  // The hook accepts a reference to the input element and manages focus on specific key events.
  
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Handle the keyboard events.
      
      if (event.key === 'k' && event.metaKey) {
        // If the user presses cmd (metaKey) + 'k', focus on the input.
        event.preventDefault(); // Prevent default browser behavior for cmd+k.
        inputRef.current?.focus(); // Focus on the search input element.
      }

      if (event.key === 'Escape') {
        // If the user presses Escape, blur (remove focus) from the input.
        inputRef.current?.blur();
      }
    }

    // Add the keydown event listener to the document.
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: remove the event listener when the component unmounts or re-renders.
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef]); // The effect depends on the inputRef, so it will rerun if the reference changes.
}
