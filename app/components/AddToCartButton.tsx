// Importing necessary types and components from external libraries.
// 'FetcherWithComponents' is used to manage data fetching state.
// 'CartForm' is a component provided by Shopify Hydrogen for handling cart actions.
// 'OptimisticCartLineInput' is a type representing an item to be added to the cart.
import { type FetcherWithComponents } from '@remix-run/react';
import { CartForm, type OptimisticCartLineInput } from '@shopify/hydrogen';

// Defining the 'AddToCartButton' component. It takes in several props:
// 1. 'analytics' (optional): Data used for tracking cart events (can be any type).
// 2. 'children': The content inside the button (e.g., button text or icons).
// 3. 'disabled' (optional): Boolean to disable the button if conditions are met.
// 4. 'lines': Array of 'OptimisticCartLineInput' representing cart items to add.
// 5. 'onClick' (optional): An optional click event handler function.
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown; // 'analytics' is marked optional and can be any type.
  children: React.ReactNode; // 'children' refers to the JSX content of the button.
  disabled?: boolean; // 'disabled' is optional and determines if the button is disabled.
  lines: Array<OptimisticCartLineInput>; // 'lines' is the cart data to be added.
  onClick?: () => void; // 'onClick' is an optional callback function for handling click events.
}) {
  return (
    // 'CartForm' component from Shopify Hydrogen is used to handle cart actions.
    // The 'route' prop specifies the endpoint for the cart ("/cart").
    // The 'inputs' prop is used to pass the 'lines' (cart items) to the form.
    // The 'action' prop uses the 'CartForm.ACTIONS.LinesAdd' constant to specify that we're adding lines (items) to the cart.
    <CartForm route="/cart" inputs={{ lines }} action={CartForm.ACTIONS.LinesAdd}>
      {/* Using a render prop function to access the fetcher, which manages the state of the form submission. */}
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          {/* Hidden input field to store analytics data, if provided.
              The value is serialized into a JSON string to be sent with the form. */}
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          
          {/* Button for submitting the form.
              - 'type="submit"' makes it submit the 'CartForm'.
              - 'onClick' is the event handler for manual button clicks.
              - 'disabled' is set based on either the 'disabled' prop or the fetcher's state.
                If 'fetcher.state' is not 'idle', it means the form is being submitted, so the button is disabled. */}
          <button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children} {/* The button label, could be text or elements passed as children. */}
          </button>
        </>
      )}
    </CartForm>
  );
}
