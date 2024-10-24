import {useOptimisticCart} from '@shopify/hydrogen'; 
// Importing the `useOptimisticCart` hook from Shopify Hydrogen to handle optimistic UI updates for the cart

import {Link} from '@remix-run/react'; 
// Importing the `Link` component from Remix for client-side navigation

import type {CartApiQueryFragment} from 'storefrontapi.generated'; 
// Importing type definition for the Cart API fragment

import {useAside} from '~/components/Aside'; 
// Importing the `useAside` hook from a local component to manage the Aside panel state

import {CartLineItem} from '~/components/CartLineItem'; 
// Importing `CartLineItem` component to render individual items in the cart

import {CartSummary} from './CartSummary'; 
// Importing `CartSummary` component to display the summary of the cart (e.g., totals)

/**
 * Type definition for the layout of the cart.
 * The cart can either be displayed on a full 'page' or in an 'aside' dialog.
 */
export type CartLayout = 'page' | 'aside';

/**
 * Props definition for the CartMain component.
 * @param cart - The data for the cart (can be null if cart is empty)
 * @param layout - Determines how the cart is displayed ('page' or 'aside')
 */
export type CartMainProps = {
  cart: CartApiQueryFragment | null; // The cart data or null if there's no cart
  layout: CartLayout; // Layout type (page or aside)
};

/**
 * The main cart component responsible for displaying cart items and the cart summary.
 * It is used in both the /cart route (page layout) and the cart aside (dialog layout).
 * 
 * @param layout - Defines whether the cart is rendered as a full page or as an aside dialog
 * @param cart - The cart data fetched from the API (null if empty)
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The `useOptimisticCart` hook is used to apply optimistic updates to the cart,
  // ensuring that changes to the cart (e.g., adding or removing items) are reflected
  // immediately in the UI, even before the server response.
  const cart = useOptimisticCart(originalCart);

  // Check if the cart has any line items (products) to display
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);

  // Determine if there are any applicable discount codes applied to the cart
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);

  // Conditionally set a class name to indicate whether the cart has discounts
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;

  // Check if the cart has items (total quantity greater than 0)
  const cartHasItems = cart?.totalQuantity! > 0;

  return (
    <div className={className}>
      {/* Render a message if the cart is empty, otherwise show cart details */}
      <CartEmpty hidden={linesCount} layout={layout} />
      
      <div className="cart-details">
        {/* Cart items section */}
        <div aria-labelledby="cart-lines">
          <ul>
            {/* Map over the cart lines (items) and render each using the CartLineItem component */}
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        </div>
        
        {/* Render the cart summary (totals, discounts) if the cart has items */}
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </div>
  );
}

/**
 * Component to display a message when the cart is empty.
 * This will be shown when there are no items in the cart.
 * 
 * @param hidden - Determines whether the empty cart message is visible
 * @param layout - (Optional) The layout type of the cart
 */
function CartEmpty({
  hidden = false,  // Whether the empty message should be hidden
  layout,         // Layout type (optional)
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside(); 
  // Get the `close` function from the Aside context to close the aside panel when navigating away

  return (
    <div hidden={hidden}> 
      {/* Hide the message if `hidden` is true */}
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you started!
        {/* Display a message encouraging the user to add items to the cart */}
      </p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport">
        {/* Provide a link to continue shopping (navigating to the collections page) */}
        Continue shopping →
      </Link>
    </div>
  );
}
