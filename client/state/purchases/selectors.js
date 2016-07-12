/**
 * Return the list of purchases from state object
 *
 * @param {Object} state - current state object
 * @return {Array} Purchases
 */
export const getPurchases = state => state.purchases.data;
export const getPurchasesError = state => state.purchases.error;

export const getUserPurchases = ( state, userId ) => (
	state.purchases.hasLoadedUserPurchasesFromServer && getPurchases( state ).filter( purchase => purchase.userId === userId )
);

/**
 * Returns a Purchase object from the state using its id
 * @param  {Object} state       global state
 * @param  {Number} purchaseId  the purchase id
 * @return {Object} the matching purchase if there is one
 */
export const getByPurchaseId = ( state, purchaseId ) => (
	getPurchases( state ).filter( purchase => purchase.id === purchaseId ).shift()
);

export const hasLoadedUserPurchasesFromServer = state => state.purchases.hasLoadedUserPurchasesFromServer;
export const isFetchingUserPurchases = state => state.purchases.isFetchingUserPurchases;
export const isFetchingSitePurchases = state => state.purchases.isFetchingSitePurchases;
