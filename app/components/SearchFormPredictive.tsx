import {
  useFetcher,
  useNavigate,
  type FormProps,
  type Fetcher,
} from '@remix-run/react';
// Importing Remix hooks and types. `useFetcher` is used to perform non-navigation fetches, `useNavigate` to programmatically navigate between routes, 
// and `FormProps` defines the form-related properties.

import React, {useRef, useEffect} from 'react';
// Importing React and its hooks: `useRef` to reference input fields and `useEffect` for running side effects.

import type {PredictiveSearchReturn} from '~/lib/search';
// Importing a type `PredictiveSearchReturn`, which likely represents the structure of search results.

import {useAside} from './Aside';
// Importing a custom hook `useAside`, which likely manages a UI element like a sidebar or a modal.

type SearchFormPredictiveChildren = (args: {
  fetchResults: (event: React.ChangeEvent<HTMLInputElement>) => void;
  goToSearch: () => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  fetcher: Fetcher<PredictiveSearchReturn>;
}) => React.ReactNode;
// Defining a type for the children prop, which is a function that receives a few arguments:
// - `fetchResults`: Function to fetch search results when the input changes.
// - `goToSearch`: Function to navigate to the search page.
// - `inputRef`: Reference to the input element.
// - `fetcher`: A Remix `Fetcher` to manage form submissions and track its state.

type SearchFormPredictiveProps = Omit<FormProps, 'children'> & {
  children: SearchFormPredictiveChildren | null;
};
// Defining the prop types for `SearchFormPredictive` component, which extends `FormProps` but excludes the `children` prop,
// and instead takes a `children` function or null.

export const SEARCH_ENDPOINT = '/search';
// Defining a constant `SEARCH_ENDPOINT`, which is the route for search requests.

/**
 * SearchFormPredictive is a component that handles predictive search functionality. It submits search queries to the `/search` endpoint and optionally
 * displays predictive search results while typing.
 * 
 * It provides the following functionalities:
 * - Fetches search results as the user types.
 * - Allows navigating to the search page with the current query.
 * - Clears the input field when the form is submitted.
 */
export function SearchFormPredictive({
  children,
  className = 'predictive-search-form',
  ...props
}: SearchFormPredictiveProps) {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  // The `useFetcher` hook manages the form submission and stores the response in `fetcher`. The response will match the `PredictiveSearchReturn` type.

  const inputRef = useRef<HTMLInputElement | null>(null);
  // Create a reference to the search input field.

  const navigate = useNavigate();
  // The `useNavigate` hook allows programmatic navigation to other routes.

  const aside = useAside();
  // The `useAside` hook likely manages a UI component, such as a sidebar, to display search results or other content.

  /** 
   * Resets the input field value and blurs the input when the form is submitted. 
   * This prevents the default form submission behavior and ensures the input is cleared.
   */
  function resetInput(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (inputRef?.current?.value) {
      inputRef.current.blur();
    }
  }

  /** 
   * Navigates to the search page with the current query term.
   * The `goToSearch` function takes the current input value and uses `navigate` to go to the search results page.
   * If there is no input value, it navigates to the base `/search` endpoint.
   */
  function goToSearch() {
    const term = inputRef?.current?.value;
    navigate(SEARCH_ENDPOINT + (term ? `?q=${term}` : ''));
    aside.close();
  }

  /**
   * Fetches predictive search results based on the current input value.
   * This function is called on the input change event and sends a GET request to fetch predictive results.
   */
  function fetchResults(event: React.ChangeEvent<HTMLInputElement>) {
    fetcher.submit(
      {q: event.target.value || '', limit: 5, predictive: true},
      {method: 'GET', action: SEARCH_ENDPOINT},
    );
  }

  // Ensure that the input field has the `type="search"` attribute.
  // This runs on component mount, and sets the type of the input to `search`, which helps in selecting the element for predictive search.
  useEffect(() => {
    inputRef?.current?.setAttribute('type', 'search');
  }, []);

  // If the `children` prop is not a function, the component will not render anything.
  if (typeof children !== 'function') {
    return null;
  }

  // Render the form using `fetcher.Form`, which allows managing the form submission state without causing navigation.
  // It passes the class name and props, and sets `onSubmit` to `resetInput` to handle input clearing.
  return (
    <fetcher.Form {...props} className={className} onSubmit={resetInput}>
      {/* The children function is called with necessary arguments: inputRef, fetcher, fetchResults, and goToSearch */}
      {children({inputRef, fetcher, fetchResults, goToSearch})}
    </fetcher.Form>
  );
}
