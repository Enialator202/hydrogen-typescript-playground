import type { CartApiQueryFragment } from 'storefrontapi.generated'; // Type for cart data from the Storefront API
import type { CartLayout } from '~/components/CartMain'; // Type for different cart layouts
import { CartForm, Money, type OptimisticCart } from '@shopify/hydrogen'; // Importing necessary components from Shopify Hydrogen
import { useRef } from 'react'; // Import React hooks
import { FetcherWithComponents } from '@remix-run/react'; // Importing Fetcher with components for Remix

// Type definition for CartSummary component props
type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>; // Cart data which can be optimistic
  layout: CartLayout; // Layout type for the cart
};

/**
 * Component to display the cart summary including totals, discounts, and checkout actions.
 * @param {CartSummaryProps} props - The properties for the component
 */
export function CartSummary({ cart, layout }: CartSummaryProps) {
  // Determine className based on layout type (page or aside)
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4>Totals</h4> {/* Heading for totals section */}
      <dl className="cart-subtotal"> {/* Description list for subtotal */}
        <dt>Subtotal</dt> {/* Term for subtotal */}
        <dd>
          {/* Check if subtotal amount exists and render it; otherwise render a dash */}
          {cart.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost?.subtotalAmount} /> // Render subtotal amount
          ) : (
            '-' // Render dash if no amount
          )}
        </dd>
      </dl>
      {/* Render discounts and gift cards if applicable */}
      <CartDiscounts discountCodes={cart.discountCodes} />
      <CartGiftCard giftCardCodes={cart.appliedGiftCards} />
      <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
    </div>
  );
}

/**
 * Component to display checkout actions.
 * @param {Object} props - The properties for the component
 * @param {string} [props.checkoutUrl] - The URL to continue to checkout
 */
function CartCheckoutActions({ checkoutUrl }: { checkoutUrl?: string }) {
  // If there's no checkout URL, render nothing
  if (!checkoutUrl) return null;

  return (
    <div>
      <a href={checkoutUrl} target="_self">
        <p>Continue to Checkout &rarr;</p> {/* Link to checkout */}
      </a>
      <br />
    </div>
  );
}

/**
 * Component to handle cart discounts.
 * @param {Object} props - The properties for the component
 * @param {Array} [props.discountCodes] - List of discount codes
 */
function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  // Filter and map discount codes to get applicable ones
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable) // Filter applicable discounts
      ?.map(({ code }) => code) || []; // Map to their codes

  return (
    <div>
      {/* If there are existing discounts, display them with an option to remove */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt> {/* Term for discounts */}
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code> {/* Display discount codes */}
              &nbsp;
              <button>Remove</button> {/* Button to remove discounts */}
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input field to apply a new discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Discount code" /> {/* Input for discount code */}
          &nbsp;
          <button type="submit">Apply</button> {/* Button to apply the discount */}
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

/**
 * Form component for updating discount codes.
 * @param {Object} props - The properties for the component
 * @param {Array} [props.discountCodes] - Existing discount codes to pre-fill the form
 * @param {React.ReactNode} props.children - Child elements to render inside the form
 */
function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode; // Child elements to render inside the form
}) {
  return (
    <CartForm
      route="/cart" // The route for the cart form submission
      action={CartForm.ACTIONS.DiscountCodesUpdate} // The action to update discount codes
      inputs={{
        discountCodes: discountCodes || [], // Pass existing discount codes
      }}
    >
      {children} {/* Render children (e.g., input fields) */}
    </CartForm>
  );
}

/**
 * Component to handle gift cards in the cart.
 * @param {Object} props - The properties for the component
 * @param {Array} props.giftCardCodes - List of applied gift card codes
 */
function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined; // Gift card codes applied to the cart
}) {
  const appliedGiftCardCodes = useRef<string[]>([]); // Ref to store applied gift card codes
  const giftCardCodeInput = useRef<HTMLInputElement>(null); // Ref for the gift card input field
  const codes: string[] =
    giftCardCodes?.map(({ lastCharacters }) => `***${lastCharacters}`) || []; // Mask gift card codes for display

  /**
   * Function to save an applied gift card code.
   * @param {string} code - The gift card code to apply
   */
  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces from the code
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode); // Add to the list if not already applied
    }
    giftCardCodeInput.current!.value = ''; // Clear the input field
  }

  /**
   * Function to remove all applied gift card codes.
   */
  function removeAppliedCode() {
    appliedGiftCardCodes.current = []; // Clear the list of applied codes
  }

  return (
    <div>
      {/* If there are applied gift cards, display them with an option to remove */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Applied Gift Card(s)</dt> {/* Term for applied gift cards */}
          <UpdateGiftCardForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code> {/* Display gift card codes */}
              &nbsp;
              <button onSubmit={() => removeAppliedCode}>Remove</button> {/* Button to remove gift cards */}
            </div>
          </UpdateGiftCardForm>
        </div>
      </dl>

      {/* Show an input to apply a new gift card */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current} // Pass currently applied gift cards
        saveAppliedCode={saveAppliedCode} // Pass function to save new gift card codes
      >
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code" // Placeholder for the input
            ref={giftCardCodeInput} // Attach ref to input field
          />
          &nbsp;
          <button type="submit">Apply</button> {/* Button to apply the gift card */}
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

/**
 * Component for updating gift card codes in the cart.
 * This form allows users to apply gift card codes to their cart.
 * 
 * @param {Object} props - The properties for the component
 * @param {Array} [props.giftCardCodes] - Existing gift card codes to pre-fill the form
 * @param {Function} [props.saveAppliedCode] - Function to call when a gift card code is saved
 * @param {Function} [props.removeAppliedCode] - Function to call when the applied gift card code is removed (not used here)
 * @param {React.ReactNode} props.children - Child elements to render inside the form
 */
function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  children,
}: {
  giftCardCodes?: string[]; // Optional array of existing gift card codes
  saveAppliedCode?: (code: string) => void; // Function to handle saving the gift card code
  removeAppliedCode?: () => void; // Function to handle removing the gift card code (not utilized in this implementation)
  children: React.ReactNode; // Children to be rendered inside the form
}) {
  return (
    <CartForm
      route="/cart" // The route to submit the form to
      action={CartForm.ACTIONS.GiftCardCodesUpdate} // The action to update gift card codes
      inputs={{
        giftCardCodes: giftCardCodes || [], // Pass existing gift card codes to the form
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        // Accessing the fetcher for handling form submission
        const code = fetcher.formData?.get('giftCardCode'); // Getting the gift card code from form data
        
        // If a code is present and the save function is provided, invoke it
        if (code) saveAppliedCode && saveAppliedCode(code as string); // Call the save function with the gift card code
        
        return children; // Render the child elements (e.g., input fields for gift card code)
      }}
    </CartForm>
  );
}
