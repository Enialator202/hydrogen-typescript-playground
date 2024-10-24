import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types'; 
// Type import for updating cart lines with the Shopify Hydrogen API

import type {CartLayout} from '~/components/CartMain'; 
// Importing CartLayout type from the CartMain component (used for layout variations)

import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen'; 
// Importing necessary components and types from Shopify's Hydrogen framework
// CartForm is used for form interactions with the cart
// Image is used for rendering product images
// OptimisticCartLine is a type that allows for optimistic UI updates

import {useVariantUrl} from '~/lib/variants'; 
// Custom hook to generate URLs based on product variants

import {Link} from '@remix-run/react'; 
// Importing Link component from Remix for client-side navigation

import {ProductPrice} from './ProductPrice'; 
// Importing a custom component to display product prices

import {useAside} from './Aside'; 
// Importing the useAside hook to handle the state of a side panel (Aside component)

import type {CartApiQueryFragment} from 'storefrontapi.generated'; 
// Importing type definition for a fragment of the Cart API query

type CartLine = OptimisticCartLine<CartApiQueryFragment>; 
// Defining the CartLine type, which extends OptimisticCartLine with the Cart API fragment

/**
 * A single line item in the cart.
 * 
 * This component displays the product image, title, price, and allows users to:
 * - Navigate to the product page by clicking on the product title
 * - Adjust the quantity of the item in the cart
 * - Remove the item from the cart
 * 
 * @param layout - Layout of the cart (e.g., whether it is displayed in an aside)
 * @param line - The individual cart line item data
 */
export function CartLineItem({
  layout,  // Determines how the cart should be displayed (e.g., in a sidebar)
  line,    // The individual line item data
}: {
  layout: CartLayout; // Expected layout type
  line: CartLine;     // The cart line item (product and related data)
}) {
  const {id, merchandise} = line; // Destructure id and merchandise from the cart line
  const {product, title, image, selectedOptions} = merchandise; // Destructure merchandise properties
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions); 
  // Generate the URL for the specific product variant

  const {close} = useAside(); 
  // Get the close function from the Aside context to close the Aside panel if necessary

  return (
    <li key={id} className="cart-line">
      {/* Render the product image if available */}
      {image && (
        <Image
          alt={title}
          aspectRatio="1/1"
          data={image}
          height={100}
          loading="lazy"  // Lazy load the image to improve performance
          width={100}
        />
      )}

      <div>
        {/* Clicking on the product title navigates to the product page */}
        <Link
          prefetch="intent"  // Prefetch product page data for faster navigation
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') {
              close(); // Close the Aside panel if the cart is displayed in it
            }
          }}
        >
          <p>
            <strong>{product.title}</strong> {/* Display product title */}
          </p>
        </Link>
        <ProductPrice price={line?.cost?.totalAmount} /> {/* Display product price */}
        <ul>
          {/* Display selected product options (e.g., size, color) */}
          {selectedOptions.map((option) => (
            <li key={option.name}>
              <small>
                {option.name}: {option.value} {/* Option name and value */}
              </small>
            </li>
          ))}
        </ul>
        <CartLineQuantity line={line} /> {/* Render quantity controls for the line item */}
      </div>
    </li>
  );
}

/**
 * Controls for updating the quantity of a cart line item.
 * 
 * - The buttons to increase or decrease the quantity are disabled if the line
 *   item is still being processed (optimistic update).
 * 
 * @param line - The individual cart line item data
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null; 
  // Return nothing if line or its quantity is undefined

  const {id: lineId, quantity, isOptimistic} = line; 
  // Destructure id, quantity, and optimistic status from the cart line
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0)); 
  // Calculate the previous quantity, ensuring it doesn't go below 0
  const nextQuantity = Number((quantity + 1).toFixed(0)); 
  // Calculate the next quantity

  return (
    <div className="cart-line-quantity">
      <small>Quantity: {quantity} &nbsp;&nbsp;</small>
      
      {/* Button to decrease the quantity */}
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic} 
          // Disable button if quantity is <= 1 or optimistic update is in progress
          name="decrease-quantity"
          value={prevQuantity}
        >
          <span>&#8722; </span> {/* Minus sign */}
        </button>
      </CartLineUpdateButton>
      &nbsp;

      {/* Button to increase the quantity */}
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic} 
          // Disable button if optimistic update is in progress
        >
          <span>&#43;</span> {/* Plus sign */}
        </button>
      </CartLineUpdateButton>
      &nbsp;

      {/* Button to remove the item from the cart */}
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button to remove a line item from the cart.
 * It is disabled while the line item is still being processed (optimistic update).
 * 
 * @param lineIds - The ids of the cart lines to remove
 * @param disabled - Whether the button should be disabled (due to optimistic update)
 */
function CartLineRemoveButton({
  lineIds,  // Array of line item ids to remove
  disabled, // Boolean flag to disable the button
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      route="/cart"  // Route to submit the form (cart page)
      action={CartForm.ACTIONS.LinesRemove} 
      // Action to remove line items from the cart
      inputs={{lineIds}}  // Line ids to be removed
    >
      <button disabled={disabled} type="submit">
        Remove
      </button>
    </CartForm>
  );
}

/**
 * A button to update the quantity of a line item in the cart.
 * 
 * @param children - The content to render inside the button (e.g., +/- icons)
 * @param lines - The cart lines to update (with new quantities)
 */
function CartLineUpdateButton({
  children,  // Button content (e.g., +/-)
  lines,     // Array of cart line updates
}: {
  children: React.ReactNode; 
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"  // Route to submit the form
      action={CartForm.ACTIONS.LinesUpdate} 
      // Action to update line item quantities
      inputs={{lines}}  // Input for the updated lines
    >
      {children} {/* Render the children content */}
    </CartForm>
  );
}
