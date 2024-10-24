import {
  createContext,  // To create a context for the Aside component's state
  type ReactNode, // Type for ReactNode (children type)
  useContext,     // To access context values within a component
  useEffect,      // To handle side effects (e.g., adding/removing event listeners)
  useState,       // To manage component state
} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed'; 
// Define a union type for the different types of Aside components
// 'closed' represents the state when no Aside is visible

type AsideContextValue = {
  type: AsideType; // The current type of the active Aside (e.g., 'search', 'cart')
  open: (mode: AsideType) => void; // Function to set the active type of Aside
  close: () => void; // Function to close the Aside by setting the type to 'closed'
};

/**
 * Aside component that acts as a modal-like sidebar with an overlay.
 * Includes an overlay that captures events (e.g., close on 'Escape' key press)
 * and closes on clicking the close button or outside the content area.
 * 
 * @param children - The content inside the Aside (e.g., search form, cart, etc.)
 * @param heading - The heading displayed inside the Aside
 * @param type - The type of Aside (e.g., 'search', 'cart')
 * 
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *   <input type="search" />
 *   ...
 * </Aside>
 * ```
 */
export function Aside({
  children,     // Child components or content passed to the Aside
  heading,      // Heading to be displayed in the Aside
  type,         // The type of Aside (e.g., 'search', 'cart')
}: {
  children?: React.ReactNode;  // Optional children (React nodes)
  type: AsideType;             // The specific type of Aside
  heading: React.ReactNode;    // Heading content for the Aside
}) {
  const { type: activeType, close } = useAside(); 
  // Get the current active type and close function from the Aside context

  const expanded = type === activeType; 
  // Determine if this specific Aside should be expanded (active)

  // Effect to handle closing the Aside on 'Escape' key press when expanded
  useEffect(() => {
    const abortController = new AbortController(); // Used to clean up event listener

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close(); // Close the Aside when 'Escape' is pressed
          }
        },
        { signal: abortController.signal }, // Automatically removes listener on cleanup
      );
    }

    // Clean up event listener when the component unmounts or when `expanded` changes
    return () => abortController.abort();
  }, [close, expanded]); // Dependencies: re-run effect if `close` or `expanded` changes

  return (
    <div
      aria-modal  // Indicates that this div acts as a modal dialog
      className={`overlay ${expanded ? 'expanded' : ''}`}  // Add 'expanded' class when active
      role="dialog" // Role for accessibility: identifies this as a dialog/modal
    >
      <button className="close-outside" onClick={close} /> 
      {/* Button to close Aside when clicking outside the content */}

      <aside>
        <header>
          <h3>{heading}</h3> 
          {/* Render the heading */}
          
          <button className="close reset" onClick={close}>
            &times; {/* Close button inside the header with 'X' symbol */}
          </button>
        </header>
        <main>{children}</main> 
        {/* Render the children content inside the Aside */}
      </aside>
    </div>
  );
}

// Create a context to manage the state of the Aside (open/close logic)
const AsideContext = createContext<AsideContextValue | null>(null); 
// Initial value is `null` because context is not available until wrapped with a provider

/**
 * AsideProvider component to wrap parts of the app that need access to Aside state.
 * It provides state and functions for managing the visibility of the Aside.
 * 
 * @param children - Components that should have access to the Aside state
 */
Aside.Provider = function AsideProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<AsideType>('closed'); 
  // State to manage which Aside type is currently active ('closed' by default)

  return (
    <AsideContext.Provider
      value={{
        type,  // Current active type of the Aside
        open: setType,  // Function to change the active type
        close: () => setType('closed'),  // Function to close the Aside
      }}
    >
      {children} 
      {/* Render children with access to Aside context */}
    </AsideContext.Provider>
  );
};

/**
 * Custom hook to access the Aside context.
 * Ensures that it's used within a valid AsideProvider context.
 */
export function useAside() {
  const aside = useContext(AsideContext); 
  // Get the Aside context value

  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
    // Throw an error if used outside of AsideProvider
  }
  return aside; 
  // Return the Aside context value (type, open, close)
}
