/**
 * External dependencies
 */
import debugFactory from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import purchasesAssembler from 'lib/purchases/assembler';
import wp from 'lib/wp';

const debug = debugFactory( 'calypso:upgrades:actions:purchases' ),
	wpcom = wp.undocumented();

const PURCHASES_FETCH_ERROR_MESSAGE = i18n.translate( 'There was an error retrieving purchases.' );

function cancelPurchase( purchaseId, onComplete ) {
	wpcom.cancelPurchase( purchaseId, ( error, data ) => {
		debug( error, data );

		const success = ! error && data.success;

		onComplete( success );
	} );
}

function deleteStoredCard( card, onComplete ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.STORED_CARDS_DELETE,
		card
	} );

	wpcom.me().storedCardDelete( card, ( error, data ) => {
		debug( error, data );

		const success = Boolean( data );

		if ( success ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.STORED_CARDS_DELETE_COMPLETED,
				card
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.STORED_CARDS_DELETE_FAILED,
				error: error.message || i18n.translate( 'There was a problem deleting the stored card.' )
			} );
		}

		onComplete( success );
	} );
}

function fetchSitePurchases( siteId ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.PURCHASES_SITE_FETCH,
		siteId
	} );

	wpcom.sitePurchases( siteId, ( error, data ) => {
		debug( error, data );

		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_SITE_FETCH_FAILED,
				error: PURCHASES_FETCH_ERROR_MESSAGE
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_SITE_FETCH_COMPLETED,
				siteId,
				purchases: purchasesAssembler.createPurchasesArray( data )
			} );
		}
	} );
}

function fetchStoredCards() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.STORED_CARDS_FETCH
	} );

	wpcom.getStoredCards( ( error, data ) => {
		debug( error, data );

		if ( data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.STORED_CARDS_FETCH_COMPLETED,
				list: data
			} );
		} else if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.STORED_CARDS_FETCH_FAILED,
				error: error.message || i18n.translate( 'There was a problem retrieving stored cards.' )
			} );
		}
	} );
}

function cancelAndRefundPurchase( purchaseId, data, onComplete ) {
	wpcom.cancelAndRefundPurchase( purchaseId, data, onComplete );
}

export {
	cancelAndRefundPurchase,
	cancelPurchase,
	deleteStoredCard,
	fetchSitePurchases,
	fetchStoredCards
};
